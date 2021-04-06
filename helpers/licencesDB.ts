import * as sqlite from "better-sqlite3";

import * as configFns from "./configFns";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";
import type * as llm from "../types/recordTypes";

import { RawRowsColumnsReturn } from "@cityssm/expressjs-server-js/types";

import { licencesDB as dbPath } from "../data/databasePaths";

import type * as expressSession from "express-session";


/*
 * REUSED FUNCTIONS
 */


export const canUpdateObject = (obj: llm.Record, reqSession: expressSession.Session) => {

  const userProperties: llm.UserProperties = reqSession.user.userProperties;

  // Check user permissions

  let canUpdate = false;

  if (!reqSession) {

    canUpdate = false;

  } else if (obj.recordDelete_timeMillis) {

    // Deleted records cannot be updated
    canUpdate = false;

  } else if (userProperties.canUpdate) {

    canUpdate = true;

  } else if (userProperties.canCreate &&
    (obj.recordCreate_userName === reqSession.user.userName ||
      obj.recordUpdate_userName === reqSession.user.userName) &&
    obj.recordUpdate_timeMillis + configFns.getProperty("user.createUpdateWindowMillis") > Date.now()) {

    // Users with only create permission can update their own records within the time window
    canUpdate = true;

  }

  // If recently updated, send back permission

  if (obj.recordUpdate_timeMillis + configFns.getProperty("user.createUpdateWindowMillis") > Date.now()) {

    return canUpdate;

  }

  // Check if object should be locked

  if (canUpdate) {

    switch (obj.recordType) {

      case "licence":

        const lockDate = new Date();
        lockDate.setMonth(lockDate.getMonth() - 1);

        const lockDateInteger = dateTimeFns.dateToInteger(lockDate);

        if ((obj as llm.LotteryLicence).endDate < lockDateInteger) {
          canUpdate = false;
        }

        break;

      case "event":

        if ((obj as llm.LotteryEvent).bank_name !== "" && (obj as llm.LotteryEvent).reportDate) {
          canUpdate = false;
        }

        break;

    }

  }

  return canUpdate;

};


export const getRawRowsColumns = (sql: string, params: Array<string | number>): RawRowsColumnsReturn => {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const stmt = db.prepare(sql);

  stmt.raw(true);

  const rows = stmt.all(params);
  const columns = stmt.columns();

  stmt.raw(false);

  db.close();

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

export const resetEventTableStats = () => {
  eventTableStatsExpiryMillis = -1;
};

export const resetLicenceTableStats = () => {
  licenceTableStatsExpiryMillis = -1;
};

let eventTableStats: llm.LotteryEventStats = {
  eventYearMin: 1970
};

let eventTableStatsExpiryMillis = -1;


export const getLicenceTableStats = () => {

  if (Date.now() < licenceTableStatsExpiryMillis) {
    return licenceTableStats;
  }

  const db = sqlite(dbPath, {
    readonly: true
  });

  licenceTableStats = db.prepare("select" +
    " min(applicationDate / 10000) as applicationYearMin," +
    " min(startDate / 10000) as startYearMin," +
    " max(endDate / 10000) as endYearMax" +
    " from LotteryLicences" +
    " where recordDelete_timeMillis is null")
    .get();

  licenceTableStatsExpiryMillis = Date.now() + (3600 * 1000);

  db.close();

  return licenceTableStats;

};


export const getLicenceTypeSummary = (reqBody: {
  applicationDateStartString?: string;
  applicationDateEndString?: string;
  licenceTypeKey?: string;
}) => {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const sqlParams = [];

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

  if (reqBody.applicationDateStartString && reqBody.applicationDateStartString !== "") {

    const applicationDateStart = dateTimeFns.dateStringToInteger(reqBody.applicationDateStartString);

    sql += " and l.applicationDate >= ?";
    sqlParams.push(applicationDateStart);

  }

  if (reqBody.applicationDateEndString && reqBody.applicationDateEndString !== "") {

    const applicationDateEnd = dateTimeFns.dateStringToInteger(reqBody.applicationDateEndString);

    sql += " and l.applicationDate <= ?";
    sqlParams.push(applicationDateEnd);

  }

  if (reqBody.licenceTypeKey && reqBody.licenceTypeKey !== "") {

    sql += " and l.licenceTypeKey = ?";
    sqlParams.push(reqBody.licenceTypeKey);

  }

  sql += " group by l.licenceID, l.externalLicenceNumber," +
    " l.applicationDate, l.issueDate," +
    " o.organizationName, lo.locationName, lo.locationAddress1," +
    " l.licenceTypeKey, l.totalPrizeValue, l.licenceFee" +
    " order by o.organizationName, o.organizationID, l.applicationDate, l.externalLicenceNumber";

  const rows = db.prepare(sql).all(sqlParams);

  db.close();

  for (const record of rows) {

    record.applicationDateString = dateTimeFns.dateIntegerToString(record.applicationDate);
    record.issueDateString = dateTimeFns.dateIntegerToString(record.issueDate);

    record.locationDisplayName =
      record.locationName === "" ? record.locationAddress1 : record.locationName;

    record.licenceType = (configFns.getLicenceType(record.licenceTypeKey) || {}).licenceType || "";
  }

  return rows;

};


export const getActiveLicenceSummary = (reqBody: {
  startEndDateStartString: string;
  startEndDateEndString: string;
}, reqSession: expressSession.Session) => {

  const db = sqlite(dbPath, {
    readonly: true
  });


  const startEndDateStart = dateTimeFns.dateStringToInteger(reqBody.startEndDateStartString);
  const startEndDateEnd = dateTimeFns.dateStringToInteger(reqBody.startEndDateEndString);


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

  const sqlParams = [startEndDateStart, startEndDateStart,
    startEndDateEnd, startEndDateEnd,
    startEndDateStart, startEndDateEnd];


  const licences: llm.LotteryLicence[] = db.prepare(sql).all(sqlParams);

  db.close();

  for (const licence of licences) {

    licence.recordType = "licence";

    licence.startDateString = dateTimeFns.dateIntegerToString(licence.startDate || 0);
    licence.endDateString = dateTimeFns.dateIntegerToString(licence.endDate || 0);

    licence.issueDateString = dateTimeFns.dateIntegerToString(licence.issueDate || 0);

    licence.locationDisplayName =
      (licence.locationName === "" ? licence.locationAddress1 : licence.locationName);

    licence.canUpdate = canUpdateObject(licence, reqSession);
  }

  return licences;
};


/*
 * EVENTS
 */


export const getEventTableStats = () => {

  if (Date.now() < eventTableStatsExpiryMillis) {
    return eventTableStats;
  }

  const db = sqlite(dbPath, {
    readonly: true
  });

  eventTableStats = db.prepare("select" +
    " min(eventDate / 10000) as eventYearMin," +
    " max(eventDate / 10000) as eventYearMax" +
    " from LotteryEvents" +
    " where recordDelete_timeMillis is null" +
    " and eventDate > 19700000")
    .get();

  eventTableStatsExpiryMillis = Date.now() + (3600 * 1000);

  db.close();

  return eventTableStats;
};


export const getRecentlyUpdateEvents = (reqSession: expressSession.Session) => {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const events: llm.LotteryEvent[] =
    db.prepare("select e.eventDate, e.reportDate," +
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

  db.close();

  for (const lotteryEvent of events) {

    lotteryEvent.recordType = "event";

    lotteryEvent.eventDateString = dateTimeFns.dateIntegerToString(lotteryEvent.eventDate);
    lotteryEvent.reportDateString = dateTimeFns.dateIntegerToString(lotteryEvent.reportDate);

    lotteryEvent.recordUpdate_dateString = dateTimeFns.dateToString(new Date(lotteryEvent.recordUpdate_timeMillis));
    lotteryEvent.recordUpdate_timeString = dateTimeFns.dateToTimeString(new Date(lotteryEvent.recordUpdate_timeMillis));

    lotteryEvent.canUpdate = canUpdateObject(lotteryEvent, reqSession);
  }

  return events;
};


/**
 * @returns TRUE if successful
 */
export const deleteEvent = (licenceID: number, eventDate: number, reqSession: expressSession.Session) => {

  const db = sqlite(dbPath);

  const nowMillis = Date.now();

  const info = db.prepare("update LotteryEvents" +
    " set recordDelete_userName = ?," +
    " recordDelete_timeMillis = ?" +
    " where licenceID = ?" +
    " and eventDate = ?" +
    " and recordDelete_timeMillis is null")
    .run(
      reqSession.user.userName,
      nowMillis,
      licenceID,
      eventDate
    );

  const changeCount = info.changes;

  db.close();

  // Purge cached stats
  eventTableStatsExpiryMillis = -1;

  return changeCount > 0;
};


export const getLicenceActivityByDateRange = (startDate: number, endDate: number, _reqBody: {}) => {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const activity = {
    startDateString: dateTimeFns.dateIntegerToString(startDate),
    endDateString: dateTimeFns.dateIntegerToString(endDate),
    licences: null as llm.LotteryLicence[],
    events: null as llm.LotteryEvent[]
  };

  // Get licences

  activity.licences =
    db.prepare("select l.licenceID, l.externalLicenceNumber," +
      " l.startDate, l.endDate," +
      " l.licenceTypeKey, l.licenceDetails," +
      " o.organizationName, lo.locationName, lo.locationAddress1" +
      " from LotteryLicences l" +
      " left join Organizations o on l.organizationID = o.organizationID" +
      " left join Locations lo on l.locationID = lo.locationID" +
      " where l.recordDelete_timeMillis is null" +
      " and (" +
      "? between l.startDate and l.endDate" +
      " or ? between l.startDate and l.endDate" +
      " or l.startDate between ? and ?" +
      " or l.endDate between ? and ?)" +
      " order by l.endDate, l.startDate")
      .all(startDate, endDate, startDate, endDate, startDate, endDate);

  for (const record of activity.licences) {
    record.startDateString = dateTimeFns.dateIntegerToString(record.startDate);
    record.endDateString = dateTimeFns.dateIntegerToString(record.endDate);
  }

  // Get events

  activity.events =
    db.prepare("select e.eventDate, l.licenceID, l.externalLicenceNumber," +
      " l.startTime, l.endTime," +
      " l.licenceTypeKey, l.licenceDetails," +
      " o.organizationName, lo.locationName, lo.locationAddress1" +
      " from LotteryEvents e" +
      " left join LotteryLicences l on e.licenceId = l.licenceID" +
      " left join Organizations o on l.organizationID = o.organizationID" +
      " left join Locations lo on l.locationID = lo.locationID" +
      " where l.recordDelete_timeMillis is null" +
      " and e.recordDelete_timeMillis is null" +
      " and e.eventDate between ? and ?" +
      " order by l.startTime, l.endTime")
      .all(startDate, endDate);

  for (const record of activity.events) {
    record.eventDateString = dateTimeFns.dateIntegerToString(record.eventDate);
    record.startTimeString = dateTimeFns.timeIntegerToString(record.startTime);
    record.endTimeString = dateTimeFns.timeIntegerToString(record.endTime);
  }

  db.close();

  return activity;
};
