import sqlite from "better-sqlite3";

import * as configFunctions from "./functions.config.js";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import type * as llm from "../types/recordTypes";

import { licencesDB as databasePath } from "../data/databasePaths.js";

import type { RawRowsColumnsReturn } from "@cityssm/expressjs-server-js/types";
import type * as expressSession from "express-session";


/*
 * REUSED FUNCTIONS
 */


export const canUpdateObject = (object: llm.Record, requestSession: expressSession.Session): boolean => {

  const userProperties = requestSession.user.userProperties;

  // Check user permissions

  let canUpdate = false;

  if (!requestSession) {

    canUpdate = false;

  } else if (object.recordDelete_timeMillis) {

    // Deleted records cannot be updated
    canUpdate = false;

  } else if (userProperties.canUpdate) {

    canUpdate = true;

  } else if (userProperties.canCreate &&
    (object.recordCreate_userName === requestSession.user.userName || object.recordUpdate_userName === requestSession.user.userName) &&
    object.recordUpdate_timeMillis + configFunctions.getProperty("user.createUpdateWindowMillis") > Date.now()) {

    // Users with only create permission can update their own records within the time window
    canUpdate = true;
  }

  // If recently updated, send back permission

  if (object.recordUpdate_timeMillis + configFunctions.getProperty("user.createUpdateWindowMillis") > Date.now()) {

    return canUpdate;

  }

  // Check if object should be locked

  if (canUpdate) {

    const lockDate = new Date();
    lockDate.setMonth(lockDate.getMonth() - 1);

    const lockDateInteger = dateTimeFns.dateToInteger(lockDate);

    switch (object.recordType) {

      case "licence":

        if ((object as llm.LotteryLicence).endDate < lockDateInteger) {
          canUpdate = false;
        }

        break;

      case "event":

        if ((object as llm.LotteryEvent).bank_name !== "" && (object as llm.LotteryEvent).reportDate) {
          canUpdate = false;
        }

        break;
    }
  }

  return canUpdate;
};


export const getRawRowsColumns = (sql: string, parameters: Array<string | number>, userFunctions: Map<string, (...parameters: unknown[]) => unknown>): RawRowsColumnsReturn => {

  const database = sqlite(databasePath, {
    readonly: true
  });

  if (userFunctions.size > 0) {

    for (const functionName of userFunctions.keys()) {
      database.function(functionName, userFunctions.get(functionName));
    }
  }

  const stmt = database.prepare(sql);

  stmt.raw(true);

  const rows = stmt.all(parameters);
  const columns = stmt.columns();

  stmt.raw(false);

  database.close();

  return {
    rows,
    columns
  };

};


/*
 * LICENCES
 */


let licenceTableStats: llm.LotteryLicenceStats = {
  applicationYearMin: 1990,
  startYearMin: 1990,
  endYearMax: new Date().getFullYear() + 1
};

let licenceTableStatsExpiryMillis = -1;

export const resetEventTableStats = (): void => {
  eventTableStatsExpiryMillis = -1;
};

export const resetLicenceTableStats = (): void => {
  licenceTableStatsExpiryMillis = -1;
};

let eventTableStats: llm.LotteryEventStats = {
  eventYearMin: 1970
};

let eventTableStatsExpiryMillis = -1;


export const getLicenceTableStats = (): llm.LotteryLicenceStats => {

  if (Date.now() < licenceTableStatsExpiryMillis) {
    return licenceTableStats;
  }

  const database = sqlite(databasePath, {
    readonly: true
  });

  licenceTableStats = database.prepare("select" +
    " min(applicationDate / 10000) as applicationYearMin," +
    " min(startDate / 10000) as startYearMin," +
    " max(endDate / 10000) as endYearMax" +
    " from LotteryLicences" +
    " where recordDelete_timeMillis is null")
    .get();

  licenceTableStatsExpiryMillis = Date.now() + (3600 * 1000);

  database.close();

  return licenceTableStats;

};


interface GetLicenceTypeSummmaryReturn {
  licenceID: number;
  externalLicenceNumber: string;
  applicationDate: number;
  applicationDateString?: string;
  issueDate: number;
  issueDateString?: string;
  organizationName: string;
  locationName: string;
  locationAddress1: string;
  locationDisplayName?: string;
  licenceTypeKey: string;
  licenceType?: string;
  totalPrizeValue: number;
  licenceFee: number;
  transactionAmountSum: number;
}


export const getLicenceTypeSummary = (requestBody: {
  applicationDateStartString?: string;
  applicationDateEndString?: string;
  licenceTypeKey?: string;
}): GetLicenceTypeSummmaryReturn[] => {

  const database = sqlite(databasePath, {
    readonly: true
  });

  const sqlParameters = [];

  let sql = "select l.licenceID, l.externalLicenceNumber," +
    " l.applicationDate, l.issueDate," +
    " o.organizationName, lo.locationName, lo.locationAddress1," +
    " l.licenceTypeKey, l.totalPrizeValue, l.licenceFee," +
    " sum(t.transactionAmount) as transactionAmountSum" +
    " from LotteryLicences l" +
    " left join Organizations o on l.organizationID = o.organizationID" +
    " left join Locations lo on l.locationID = lo.locationID" +
    " left join LotteryLicenceTransactions t on l.licenceID = t.licenceID and t.recordDelete_timeMillis is null" +
    " where l.recordDelete_timeMillis is null";

  if (requestBody.applicationDateStartString && requestBody.applicationDateStartString !== "") {

    const applicationDateStart = dateTimeFns.dateStringToInteger(requestBody.applicationDateStartString);

    sql += " and l.applicationDate >= ?";
    sqlParameters.push(applicationDateStart);
  }

  if (requestBody.applicationDateEndString && requestBody.applicationDateEndString !== "") {

    const applicationDateEnd = dateTimeFns.dateStringToInteger(requestBody.applicationDateEndString);

    sql += " and l.applicationDate <= ?";
    sqlParameters.push(applicationDateEnd);
  }

  if (requestBody.licenceTypeKey && requestBody.licenceTypeKey !== "") {

    sql += " and l.licenceTypeKey = ?";
    sqlParameters.push(requestBody.licenceTypeKey);
  }

  sql += " group by l.licenceID, l.externalLicenceNumber," +
    " l.applicationDate, l.issueDate," +
    " o.organizationName, lo.locationName, lo.locationAddress1," +
    " l.licenceTypeKey, l.totalPrizeValue, l.licenceFee" +
    " order by o.organizationName, o.organizationID, l.applicationDate, l.externalLicenceNumber";

  const rows = database.prepare(sql).all(sqlParameters) as GetLicenceTypeSummmaryReturn[];

  database.close();

  for (const record of rows) {

    record.applicationDateString = dateTimeFns.dateIntegerToString(record.applicationDate);
    record.issueDateString = dateTimeFns.dateIntegerToString(record.issueDate);

    record.locationDisplayName =
      record.locationName === "" ? record.locationAddress1 : record.locationName;

    record.licenceType = (configFunctions.getLicenceType(record.licenceTypeKey) || {}).licenceType || "";
  }

  return rows;
};


export const getActiveLicenceSummary = (requestBody: {
  startEndDateStartString: string;
  startEndDateEndString: string;
}, requestSession: expressSession.Session): llm.LotteryLicence[] => {

  const database = sqlite(databasePath, {
    readonly: true
  });


  const startEndDateStart = dateTimeFns.dateStringToInteger(requestBody.startEndDateStartString);
  const startEndDateEnd = dateTimeFns.dateStringToInteger(requestBody.startEndDateEndString);


  const sql = "select l.licenceID, l.externalLicenceNumber," +
    " l.issueDate, l.startDate, l.endDate, l.licenceTypeKey," +
    " o.organizationID, o.organizationName," +
    " lo.locationID, lo.locationName, lo.locationAddress1," +
    " l.recordCreate_userName, l.recordCreate_timeMillis, l.recordUpdate_userName, l.recordUpdate_timeMillis" +
    " from LotteryLicences l" +
    " left join Organizations o on l.organizationID = o.organizationID" +
    " left join Locations lo on l.locationID = lo.locationID" +
    " where l.recordDelete_timeMillis is null" +
    " and l.issueDate is not null" +
    " and (" +
    "(l.startDate <= ? and l.endDate >= ?)" +
    " or (l.startDate <= ? and l.endDate >= ?)" +
    " or (l.startDate >= ? and l.endDate <= ?)" +
    ")";

  const sqlParameters = [startEndDateStart, startEndDateStart,
    startEndDateEnd, startEndDateEnd,
    startEndDateStart, startEndDateEnd];


  const licences: llm.LotteryLicence[] = database.prepare(sql).all(sqlParameters);

  database.close();

  for (const licence of licences) {

    licence.recordType = "licence";

    licence.startDateString = dateTimeFns.dateIntegerToString(licence.startDate || 0);
    licence.endDateString = dateTimeFns.dateIntegerToString(licence.endDate || 0);

    licence.issueDateString = dateTimeFns.dateIntegerToString(licence.issueDate || 0);

    licence.locationDisplayName =
      (licence.locationName === "" ? licence.locationAddress1 : licence.locationName);

    licence.canUpdate = canUpdateObject(licence, requestSession);
  }

  return licences;
};


/*
 * EVENTS
 */


export const getEventTableStats = (): llm.LotteryEventStats => {

  if (Date.now() < eventTableStatsExpiryMillis) {
    return eventTableStats;
  }

  const database = sqlite(databasePath, {
    readonly: true
  });

  eventTableStats = database.prepare("select" +
    " min(eventDate / 10000) as eventYearMin," +
    " max(eventDate / 10000) as eventYearMax" +
    " from LotteryEvents" +
    " where recordDelete_timeMillis is null" +
    " and eventDate > 19700000")
    .get();

  eventTableStatsExpiryMillis = Date.now() + (3600 * 1000);

  database.close();

  return eventTableStats;
};


export const getRecentlyUpdateEvents = (requestSession: expressSession.Session): llm.LotteryEvent[] => {

  const database = sqlite(databasePath, {
    readonly: true
  });

  const events: llm.LotteryEvent[] =
    database.prepare("select e.eventDate, e.reportDate," +
      " l.licenceID, l.externalLicenceNumber, l.licenceTypeKey, l.licenceDetails," +
      " o.organizationName," +
      " e.recordCreate_userName, e.recordCreate_timeMillis, e.recordUpdate_userName, e.recordUpdate_timeMillis" +
      " from LotteryEvents e" +
      " left join LotteryLicences l on e.licenceID = l.licenceID" +
      " left join Locations lo on l.locationID = lo.locationID" +
      " left join Organizations o on l.organizationID = o.organizationID" +
      " where e.recordDelete_timeMillis is null" +
      " and l.recordDelete_timeMillis is null" +
      " and o.recordDelete_timeMillis is null" +

      " order by e.recordUpdate_timeMillis desc" +
      " limit 100")
      .all();

  database.close();

  for (const lotteryEvent of events) {

    lotteryEvent.recordType = "event";

    lotteryEvent.eventDateString = dateTimeFns.dateIntegerToString(lotteryEvent.eventDate);
    lotteryEvent.reportDateString = dateTimeFns.dateIntegerToString(lotteryEvent.reportDate);

    lotteryEvent.recordUpdate_dateString = dateTimeFns.dateToString(new Date(lotteryEvent.recordUpdate_timeMillis));
    lotteryEvent.recordUpdate_timeString = dateTimeFns.dateToTimeString(new Date(lotteryEvent.recordUpdate_timeMillis));

    lotteryEvent.canUpdate = canUpdateObject(lotteryEvent, requestSession);
  }

  return events;
};
