"use strict";

import sqlite = require("better-sqlite3");
const dbPath = "data/licences.db";

import * as llm from "./llmTypes";
import * as configFns from "./configFns";
import * as dateTimeFns from "./dateTimeFns";


/*
 * REUSED FUNCTIONS
 */


function canUpdateObject(obj: llm.Record, reqSession: Express.SessionData) {

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

    const currentDateInteger = dateTimeFns.dateToInteger(new Date());

    switch (obj.recordType) {

      case "licence":

        if ((<llm.LotteryLicence>obj).endDate < currentDateInteger) {

          canUpdate = false;

        }
        break;

      case "event":

        if ((<llm.LotteryEvent>obj).bank_name !== "" && (<llm.LotteryEvent>obj).costs_receipts) {

          canUpdate = false;

        }

        break;

    }

  }

  return canUpdate;

}


function getApplicationSettingWithDB(db: sqlite.Database, settingKey: string): string {

  const row = db.prepare("select settingValue" +
    " from ApplicationSettings" +
    " where SettingKey = ?")
    .get(settingKey);

  if (row) {

    return row.settingValue || "";

  }

  return "";

}


function getLicenceWithDB(db: sqlite.Database, licenceID: number, reqSession: Express.SessionData, queryOptions: {
  includeTicketTypes: boolean,
  includeFields: boolean,
  includeEvents: boolean,
  includeAmendments: boolean,
  includeTransactions: boolean
}) {

  const licenceObj: llm.LotteryLicence =
    db.prepare("select l.*," +
      " lo.locationName, lo.locationAddress1" +
      " from LotteryLicences l" +
      " left join Locations lo on l.locationID = lo.locationID" +
      " where l.recordDelete_timeMillis is null" +
      " and l.licenceID = ?")
      .get(licenceID);

  if (!licenceObj) {
    return null;
  }

  licenceObj.recordType = "licence";

  licenceObj.applicationDateString = dateTimeFns.dateIntegerToString(licenceObj.applicationDate || 0);

  licenceObj.startDateString = dateTimeFns.dateIntegerToString(licenceObj.startDate || 0);
  licenceObj.endDateString = dateTimeFns.dateIntegerToString(licenceObj.endDate || 0);

  licenceObj.startTimeString = dateTimeFns.timeIntegerToString(licenceObj.startTime || 0);
  licenceObj.endTimeString = dateTimeFns.timeIntegerToString(licenceObj.endTime || 0);

  licenceObj.issueDateString = dateTimeFns.dateIntegerToString(licenceObj.issueDate || 0);
  licenceObj.issueTimeString = dateTimeFns.timeIntegerToString(licenceObj.issueTime || 0);

  licenceObj.locationDisplayName =
    (licenceObj.locationName === "" ? licenceObj.locationAddress1 : licenceObj.locationName);

  licenceObj.canUpdate = canUpdateObject(licenceObj, reqSession);

  /*
   * Ticket types
   */

  if (queryOptions && "includeTicketTypes" in queryOptions && queryOptions.includeTicketTypes) {

    const ticketTypesList = db.prepare("select t.ticketType," +
      " t.distributorLocationID," +
      " d.locationName as distributorLocationName, d.locationAddress1 as distributorLocationAddress1," +
      " t.manufacturerLocationID," +
      " m.locationName as manufacturerLocationName, m.locationAddress1 as manufacturerLocationAddress1," +
      " t.unitCount, t.licenceFee" +
      " from LotteryLicenceTicketTypes t" +
      " left join Locations d on t.distributorLocationID = d.locationID" +
      " left join Locations m on t.manufacturerLocationID = m.locationID" +
      " where t.recordDelete_timeMillis is null" +
      " and t.licenceID = ?" +
      " order by t.ticketType")
      .all(licenceID);

    for (let index = 0; index < ticketTypesList.length; index += 1) {

      const ticketTypeObj = ticketTypesList[index];

      ticketTypeObj.distributorLocationDisplayName = ticketTypeObj.distributorLocationName === "" ?
        ticketTypeObj.distributorLocationAddress1 :
        ticketTypeObj.distributorLocationName;

      ticketTypeObj.manufacturerLocationDisplayName = ticketTypeObj.manufacturerLocationName === "" ?
        ticketTypeObj.manufacturerLocationAddress1 :
        ticketTypeObj.manufacturerLocationName;

    }

    licenceObj.licenceTicketTypes = ticketTypesList;

  }

  /*
   * Licence fields
   */

  if (queryOptions && "includeFields" in queryOptions && queryOptions.includeFields) {

    const fieldList = db.prepare("select * from LotteryLicenceFields" +
      " where licenceID = ?")
      .all(licenceID);

    licenceObj.licenceFields = fieldList;

  }

  /*
   * Events
   */

  if (queryOptions && "includeEvents" in queryOptions && queryOptions.includeEvents) {

    const eventList = db.prepare("select eventDate from LotteryEvents" +
      " where licenceID = ?" +
      " and recordDelete_timeMillis is null" +
      " order by eventDate")
      .all(licenceID);

    for (let index = 0; index < eventList.length; index += 1) {

      const eventObj = eventList[index];
      eventObj.eventDateString = dateTimeFns.dateIntegerToString(eventObj.eventDate);

    }

    licenceObj.events = eventList;

  }

  /*
   * Licence amendments
   */

  if (queryOptions && "includeAmendments" in queryOptions && queryOptions.includeAmendments) {

    const amendments = db.prepare("select *" +
      " from LotteryLicenceAmendments" +
      " where licenceID = ?" +
      " and recordDelete_timeMillis is null" +
      " order by amendmentDate, amendmentTime, amendmentIndex")
      .all(licenceID);

    for (let index = 0; index < amendments.length; index += 1) {

      const amendmentObj = amendments[index];
      amendmentObj.amendmentDateString = dateTimeFns.dateIntegerToString(amendmentObj.amendmentDate);
      amendmentObj.amendmentTimeString = dateTimeFns.timeIntegerToString(amendmentObj.amendmentTime);

    }

    licenceObj.licenceAmendments = amendments;

  }

  /*
   * Transactions
   */

  if (queryOptions && "includeTransactions" in queryOptions && queryOptions.includeTransactions) {

    const transactions = db.prepare("select * from LotteryLicenceTransactions" +
      " where licenceID = ?" +
      " and recordDelete_timeMillis is null" +
      " order by transactionDate, transactionTime, transactionIndex")
      .all(licenceID);

    for (let index = 0; index < transactions.length; index += 1) {

      const amendmentObj = transactions[index];
      amendmentObj.transactionDateString = dateTimeFns.dateIntegerToString(amendmentObj.transactionDate);
      amendmentObj.transactionTimeString = dateTimeFns.timeIntegerToString(amendmentObj.transactionTime);

    }

    licenceObj.licenceTransactions = transactions;

  }

  return licenceObj;

}


function addLicenceAmendmentWithDB(db: sqlite.Database, licenceID: number, amendmentType: string, amendment: string, isHidden: number, reqSession: Express.SessionData) {

  const amendmentIndexRecord = db.prepare("select amendmentIndex" +
    " from LotteryLicenceAmendments" +
    " where licenceID = ?" +
    " order by amendmentIndex desc" +
    " limit 1")
    .get(licenceID);

  const amendmentIndex: number = (amendmentIndexRecord ? amendmentIndexRecord.amendmentIndex : 0) + 1;

  const nowDate = new Date();

  const amendmentDate = dateTimeFns.dateToInteger(nowDate);
  const amendmentTime = dateTimeFns.dateToTimeInteger(nowDate);

  db.prepare("insert into LotteryLicenceAmendments" +
    " (licenceID, amendmentIndex, amendmentDate, amendmentTime, amendmentType, amendment, isHidden," +
    " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
    " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(
      licenceID,
      amendmentIndex,
      amendmentDate,
      amendmentTime,
      amendmentType,
      amendment,
      isHidden,
      reqSession.user.userName,
      nowDate.getTime(),
      reqSession.user.userName,
      nowDate.getTime()
    );

  return amendmentIndex;

}


export function getRawRowsColumns(sql: string, params: any[]): llm.RawRowsColumnsReturn {

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
    rows: rows,
    columns: columns
  };

}



/*
 * LOCATIONS
 */

export function getLocations(reqSession: Express.SessionData, queryOptions: {
  limit: number,
  offset?: number,
  locationNameAddress: string,
  locationIsDistributor: number,
  locationIsManufacturer: number
}) {

  const addCalculatedFieldsFn = function(ele: llm.Location) {

    ele.recordType = "location";

    ele.locationDisplayName =
      ele.locationName === "" ? ele.locationAddress1 : ele.locationName;

    ele.licences_endDateMaxString = dateTimeFns.dateIntegerToString(ele.licences_endDateMax);
    ele.distributor_endDateMaxString = dateTimeFns.dateIntegerToString(ele.distributor_endDateMax);
    ele.manufacturer_endDateMaxString = dateTimeFns.dateIntegerToString(ele.manufacturer_endDateMax);

    ele.canUpdate = canUpdateObject(ele, reqSession);
  }

  const db = sqlite(dbPath, {
    readonly: true
  });

  // build where clause

  const sqlParams = [];

  let sqlWhereClause = " where lo.recordDelete_timeMillis is null";

  if (queryOptions.locationNameAddress && queryOptions.locationNameAddress !== "") {

    const locationNameAddressSplit = queryOptions.locationNameAddress.toLowerCase().split(" ");

    for (let index = 0; index < locationNameAddressSplit.length; index += 1) {

      sqlWhereClause += " and (instr(lower(lo.locationName), ?) or instr(lower(lo.locationAddress1),?))";
      sqlParams.push(locationNameAddressSplit[index]);
      sqlParams.push(locationNameAddressSplit[index]);

    }

  }

  if ("locationIsDistributor" in queryOptions && queryOptions.locationIsDistributor !== -1) {

    sqlWhereClause += " and lo.locationIsDistributor = ?";
    sqlParams.push(queryOptions.locationIsDistributor);

  }

  if ("locationIsManufacturer" in queryOptions && queryOptions.locationIsManufacturer !== -1) {

    sqlWhereClause += " and lo.locationIsManufacturer = ?";
    sqlParams.push(queryOptions.locationIsManufacturer);

  }

  // if limit is used, get the count

  let count = 0;

  if (queryOptions.limit !== -1) {

    count = db.prepare("select ifnull(count(*), 0) as cnt" +
      " from Locations lo" +
      sqlWhereClause)
      .get(sqlParams)
      .cnt;
  }

  let sql = "select lo.locationID, lo.locationName," +
    " lo.locationAddress1, lo.locationAddress2, lo.locationCity, lo.locationProvince," +
    " lo.locationIsDistributor, lo.locationIsManufacturer," +
    " l.licences_endDateMax, coalesce(l.licences_count, 0) as licences_count," +
    " d.distributor_endDateMax, coalesce(d.distributor_count, 0) as distributor_count," +
    " m.manufacturer_endDateMax, coalesce(m.manufacturer_count, 0) as manufacturer_count" +
    " from Locations lo" +

    (" left join (" +
      "select locationID," +
      " count(licenceID) as licences_count, max(endDate) as licences_endDateMax" +
      " from LotteryLicences" +
      " where recordDelete_timeMillis is null" +
      " group by locationID" +
      ") l on lo.locationID = l.locationID") +

    (" left join (" +
      "select t.distributorLocationID," +
      " count(*) as distributor_count, max(l.endDate) as distributor_endDateMax" +
      " from LotteryLicenceTicketTypes t" +
      " left join LotteryLicences l on t.licenceID = l.licenceID" +
      " where t.recordDelete_timeMillis is null" +
      " group by t.distributorLocationID" +
      ") d on lo.locationID = d.distributorLocationID") +

    (" left join (" +
      "select t.manufacturerLocationID," +
      " count(*) as manufacturer_count, max(l.endDate) as manufacturer_endDateMax" +
      " from LotteryLicenceTicketTypes t" +
      " left join LotteryLicences l on t.licenceID = l.licenceID" +
      " where t.recordDelete_timeMillis is null" +
      " group by t.manufacturerLocationID" +
      ") m on lo.locationID = m.manufacturerLocationID") +

    sqlWhereClause +

    " group by lo.locationID, lo.locationName," +
    " lo.locationAddress1, lo.locationAddress2, lo.locationCity, lo.locationProvince," +
    " lo.locationIsDistributor, lo.locationIsManufacturer" +
    " order by case when lo.locationName = '' then lo.locationAddress1 else lo.locationName end";

  if (queryOptions.limit !== -1) {
    sql += " limit " + queryOptions.limit + " offset " + queryOptions.offset;
  }

  const rows: llm.Location[] =
    db.prepare(sql).all(sqlParams);

  db.close();

  rows.forEach(addCalculatedFieldsFn);

  return {
    count: (queryOptions.limit === -1 ? rows.length : count),
    locations: rows
  };

}

export function getLocation(locationID: number, reqSession: Express.SessionData) {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const locationObj: llm.Location =
    db.prepare("select * from Locations" +
      " where locationID = ?")
      .get(locationID);

  if (locationObj) {
    locationObj.recordType = "location";
    locationObj.canUpdate = canUpdateObject(locationObj, reqSession);
  }

  db.close();

  locationObj.locationDisplayName =
    locationObj.locationName === "" ? locationObj.locationAddress1 : locationObj.locationName;

  return locationObj;

}

/**
 * @returns New locationID
 */
export function createLocation(reqBody: llm.Location, reqSession: Express.SessionData) {

  const db = sqlite(dbPath);

  const nowMillis = Date.now();

  const info = db.prepare("insert into Locations" +
    " (locationName, locationAddress1, locationAddress2, locationCity, locationProvince, locationPostalCode," +
    " locationIsDistributor, locationIsManufacturer," +
    " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
    " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(
      reqBody.locationName,
      reqBody.locationAddress1,
      reqBody.locationAddress2,
      reqBody.locationCity,
      reqBody.locationProvince,
      reqBody.locationPostalCode,
      reqBody.locationIsDistributor || 0,
      reqBody.locationIsManufacturer || 0,
      reqSession.user.userName,
      nowMillis,
      reqSession.user.userName,
      nowMillis
    );

  db.close();

  return Number(info.lastInsertRowid);

}

/**
 * @returns TRUE if successful
 */
export function updateLocation(reqBody: llm.Location, reqSession: Express.SessionData): boolean {

  const db = sqlite(dbPath);

  const nowMillis = Date.now();

  const info = db.prepare("update Locations" +
    " set locationName = ?," +
    " locationAddress1 = ?," +
    " locationAddress2 = ?," +
    " locationCity = ?," +
    " locationProvince = ?," +
    " locationPostalCode = ?," +
    " locationIsDistributor = ?," +
    " locationIsManufacturer = ?," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where recordDelete_timeMillis is null" +
    " and locationID = ?")
    .run(
      reqBody.locationName,
      reqBody.locationAddress1,
      reqBody.locationAddress2,
      reqBody.locationCity,
      reqBody.locationProvince,
      reqBody.locationPostalCode,
      reqBody.locationIsDistributor ? 1 : 0,
      reqBody.locationIsManufacturer ? 1 : 0,
      reqSession.user.userName,
      nowMillis,
      reqBody.locationID
    );

  db.close();

  return info.changes > 0;

}

/**
 * @returns TRUE if successful
 */
export function deleteLocation(locationID: number, reqSession: Express.SessionData): boolean {

  const db = sqlite(dbPath);

  const nowMillis = Date.now();

  const info = db.prepare("update Locations" +
    " set recordDelete_userName = ?," +
    " recordDelete_timeMillis = ?" +
    " where recordDelete_timeMillis is null" +
    " and locationID = ?")
    .run(
      reqSession.user.userName,
      nowMillis,
      locationID
    );

  db.close();

  return info.changes > 0;

}

/**
 * @returns TRUE if successful
 */
export function restoreLocation(locationID: number, reqSession: Express.SessionData): boolean {

  const db = sqlite(dbPath);

  const nowMillis = Date.now();

  const info = db.prepare("update Locations" +
    " set recordDelete_userName = null," +
    " recordDelete_timeMillis = null," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where recordDelete_timeMillis is not null" +
    " and locationID = ?")
    .run(
      reqSession.user.userName,
      nowMillis,
      locationID
    );

  db.close();

  return info.changes > 0;

}

/**
 * @returns TRUE if successful
 */
export function mergeLocations(targetLocationID: number, sourceLocationID: number, reqSession: Express.SessionData) {

  const db = sqlite(dbPath);

  const nowMillis = Date.now();

  // Get locationAttributes

  const locationAttributes = db.prepare("select max(locationIsDistributor) as locationIsDistributorMax," +
    " max(locationIsManufacturer) as locationIsManufacturerMax," +
    " count(locationID) as locationCount" +
    " from Locations" +
    " where recordDelete_timeMillis is null" +
    " and (locationID = ? or locationID = ?)")
    .get(targetLocationID, sourceLocationID);

  if (!locationAttributes) {

    db.close();
    return false;

  }

  if (locationAttributes.locationCount !== 2) {

    db.close();
    return false;

  }

  // Update the target location

  db.prepare("update Locations" +
    " set locationIsDistributor = ?," +
    " locationIsManufacturer = ?" +
    " where locationID = ?")
    .run(
      locationAttributes.locationIsDistributorMax,
      locationAttributes.locationIsManufacturerMax,
      targetLocationID
    );

  // Update records assigned to the source location

  db.prepare("update LotteryLicences" +
    " set locationID = ?" +
    " where locationID = ?" +
    " and recordDelete_timeMillis is null")
    .run(targetLocationID, sourceLocationID);

  db.prepare("update LotteryLicenceTicketTypes" +
    " set distributorLocationID = ?" +
    " where distributorLocationID = ?" +
    " and recordDelete_timeMillis is null")
    .run(targetLocationID, sourceLocationID);

  db.prepare("update LotteryLicenceTicketTypes" +
    " set manufacturerLocationID = ?" +
    " where manufacturerLocationID = ?" +
    " and recordDelete_timeMillis is null")
    .run(targetLocationID, sourceLocationID);

  // Set the source record to inactive

  db.prepare("update Locations" +
    " set recordDelete_userName = ?," +
    " recordDelete_timeMillis = ?" +
    " where locationID = ?")
    .run(
      reqSession.user.userName,
      nowMillis,
      sourceLocationID
    );

  db.close();

  return true;

}


export function getInactiveLocations(inactiveYears: number) {

  const cutoffDate = new Date();
  cutoffDate.setFullYear(cutoffDate.getFullYear() - inactiveYears);

  const cutoffDateInteger = dateTimeFns.dateToInteger(cutoffDate);

  const db = sqlite(dbPath, {
    readonly: true
  });

  const rows: llm.Location[] = db.prepare("select lo.locationID, lo.locationName, lo.locationAddress1," +
    " lo.recordUpdate_timeMillis, lo.recordUpdate_userName," +
    " l.licences_endDateMax, d.distributor_endDateMax, m.manufacturer_endDateMax" +
    " from Locations lo" +

    (" left join (" +
      "select l.locationID, max(l.endDate) as licences_endDateMax from LotteryLicences l" +
      " where l.recordDelete_timeMillis is null" +
      " group by l.locationID" +
      ") l on lo.locationID = l.locationID") +

    (" left join (" +
      "select tt.distributorLocationID, max(l.endDate) as distributor_endDateMax" +
      " from LotteryLicenceTicketTypes tt" +
      " left join LotteryLicences l on tt.licenceID = l.licenceID" +
      " where l.recordDelete_timeMillis is null" +
      " group by tt.distributorLocationID" +
      ") d on lo.locationID = d.distributorLocationID") +

    (" left join (" +
      "select tt.manufacturerLocationID, max(l.endDate) as manufacturer_endDateMax" +
      " from LotteryLicenceTicketTypes tt" +
      " left join LotteryLicences l on tt.licenceID = l.licenceID" +
      " where l.recordDelete_timeMillis is null" +
      " group by tt.manufacturerLocationID" +
      ") m on lo.locationID = m.manufacturerLocationID") +

    " where lo.recordDelete_timeMillis is null" +

    " and max(ifnull(l.licences_endDateMax, 0), ifnull(d.distributor_endDateMax, 0), ifnull(m.manufacturer_endDateMax, 0)) <= ?" +

    " order by lo.locationName, lo.locationAddress1, lo.locationID")
    .all(cutoffDateInteger);

  db.close();

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {

    const locationObj = rows[rowIndex];

    locationObj.locationDisplayName =
      locationObj.locationName === "" ? locationObj.locationAddress1 : locationObj.locationName;

    locationObj.recordUpdate_dateString = dateTimeFns.dateToString(new Date(locationObj.recordUpdate_timeMillis));

    locationObj.licences_endDateMaxString = dateTimeFns.dateIntegerToString(locationObj.licences_endDateMax || 0);
    locationObj.distributor_endDateMaxString = dateTimeFns.dateIntegerToString(locationObj.distributor_endDateMax || 0);
    locationObj.manufacturer_endDateMaxString = dateTimeFns.dateIntegerToString(locationObj.manufacturer_endDateMax || 0);

  }

  return rows;
}

/*
 * ORGANIZATIONS
 */

export function getOrganizations(reqBody: any, reqSession: Express.SessionData, includeOptions: {
  limit: number,
  offset?: number
}) {

  const addCalculatedFieldsFn = function(ele: llm.Organization) {

    ele.recordType = "organization";

    ele.licences_endDateMaxString = dateTimeFns.dateIntegerToString(ele.licences_endDateMax || 0);

    ele.canUpdate = canUpdateObject(ele, reqSession);

    delete ele.recordCreate_userName;
    delete ele.recordCreate_timeMillis;
    delete ele.recordUpdate_userName;
    delete ele.recordUpdate_timeMillis;

  };

  const db = sqlite(dbPath, {
    readonly: true
  });

  const sqlParams = [dateTimeFns.dateToInteger(new Date())];

  let sql = "select o.organizationID, o.organizationName, o.isEligibleForLicences, o.organizationNote," +
    " r.representativeName," +
    " sum(case when l.endDate >= ? then 1 else 0 end) as licences_activeCount," +
    " max(l.endDate) as licences_endDateMax," +
    " o.recordCreate_userName, o.recordCreate_timeMillis, o.recordUpdate_userName, o.recordUpdate_timeMillis" +
    " from Organizations o" +
    " left join OrganizationRepresentatives r on o.organizationID = r.organizationID and r.isDefault = 1" +
    " left join LotteryLicences l on o.organizationID = l.organizationID and l.recordDelete_timeMillis is null" +
    " where o.recordDelete_timeMillis is null";

  if (reqBody.organizationName && reqBody.organizationName !== "") {

    const organizationNamePieces = reqBody.organizationName.toLowerCase().split(" ");

    for (let pieceIndex = 0; pieceIndex < organizationNamePieces.length; pieceIndex += 1) {

      sql += " and instr(lower(o.organizationName), ?)";
      sqlParams.push(organizationNamePieces[pieceIndex]);

    }

  }

  if (reqBody.representativeName && reqBody.representativeName !== "") {

    sql += " and o.organizationID in (" +
      "select organizationID from OrganizationRepresentatives where instr(lower(representativeName), ?)" +
      ")";
    sqlParams.push(reqBody.representativeName.toLowerCase());

  }

  if (reqBody.isEligibleForLicences && reqBody.isEligibleForLicences !== "") {

    sql += " and o.isEligibleForLicences = ?";
    sqlParams.push(reqBody.isEligibleForLicences);

  }

  sql += " group by o.organizationID, o.organizationName, o.isEligibleForLicences, o.organizationNote," +
    " r.representativeName," +
    " o.recordCreate_userName, o.recordCreate_timeMillis, o.recordUpdate_userName, o.recordUpdate_timeMillis" +
    " order by o.organizationName, o.organizationID";

  if (includeOptions.limit !== -1) {

    sql += " limit " + includeOptions.limit + " offset " + includeOptions.offset;

  }

  const rows: llm.Organization[] = db.prepare(sql).all(sqlParams);

  db.close();

  rows.forEach(addCalculatedFieldsFn);

  return rows;

}

export function getOrganization(organizationID: number, reqSession: Express.SessionData): llm.Organization {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const organizationObj: llm.Organization =
    db.prepare("select * from Organizations" +
      " where organizationID = ?")
      .get(organizationID);

  if (organizationObj) {

    organizationObj.recordType = "organization";

    organizationObj.fiscalStartDateString = dateTimeFns.dateIntegerToString(organizationObj.fiscalStartDate);
    organizationObj.fiscalEndDateString = dateTimeFns.dateIntegerToString(organizationObj.fiscalEndDate);

    organizationObj.canUpdate = canUpdateObject(organizationObj, reqSession);

    const representativesList: llm.OrganizationRepresentative[] =
      db.prepare("select * from OrganizationRepresentatives" +
        " where organizationID = ?" +
        " order by isDefault desc, representativeName")
        .all(organizationID);

    organizationObj.organizationRepresentatives = representativesList;

  }

  db.close();

  return organizationObj;

}

/**
 * @returns New organizationID
 */
export function createOrganization(reqBody: llm.Organization, reqSession: Express.SessionData) {

  const db = sqlite(dbPath);

  const nowMillis = Date.now();

  const info = db.prepare("insert into Organizations (" +
    "organizationName, organizationAddress1, organizationAddress2," +
    " organizationCity, organizationProvince, organizationPostalCode," +
    " organizationNote," +
    " recordCreate_userName, recordCreate_timeMillis," +
    " recordUpdate_userName, recordUpdate_timeMillis)" +
    " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(
      reqBody.organizationName,
      reqBody.organizationAddress1,
      reqBody.organizationAddress2,
      reqBody.organizationCity,
      reqBody.organizationProvince,
      reqBody.organizationPostalCode,
      "",
      reqSession.user.userName,
      nowMillis,
      reqSession.user.userName,
      nowMillis
    );

  db.close();

  return Number(info.lastInsertRowid);

}

/**
 * @returns TRUE if successful
 */
export function updateOrganization(reqBody: llm.Organization, reqSession: Express.SessionData): boolean {

  const db = sqlite(dbPath);

  const nowMillis = Date.now();

  const info = db.prepare("update Organizations" +
    " set organizationName = ?," +
    " organizationAddress1 = ?," +
    " organizationAddress2 = ?," +
    " organizationCity = ?," +
    " organizationProvince = ?," +
    " organizationPostalCode = ?," +
    " fiscalStartDate = ?," +
    " fiscalEndDate = ?," +
    " isEligibleForLicences = ?," +
    " organizationNote = ?," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where organizationID = ?" +
    " and recordDelete_timeMillis is null")
    .run(
      reqBody.organizationName,
      reqBody.organizationAddress1,
      reqBody.organizationAddress2,
      reqBody.organizationCity,
      reqBody.organizationProvince,
      reqBody.organizationPostalCode,
      dateTimeFns.dateStringToInteger(reqBody.fiscalStartDateString),
      dateTimeFns.dateStringToInteger(reqBody.fiscalEndDateString),
      reqBody.isEligibleForLicences,
      reqBody.organizationNote,
      reqSession.user.userName,
      nowMillis,
      reqBody.organizationID
    );

  db.close();

  return info.changes > 0;

}

/**
 * @returns TRUE if successful
 */
export function deleteOrganization(organizationID: number, reqSession: Express.SessionData): boolean {

  const db = sqlite(dbPath);

  const nowMillis = Date.now();

  const info = db.prepare("update Organizations" +
    " set recordDelete_userName = ?," +
    " recordDelete_timeMillis = ?" +
    " where organizationID = ?" +
    " and recordDelete_timeMillis is null")
    .run(
      reqSession.user.userName,
      nowMillis,
      organizationID
    );

  db.close();

  return info.changes > 0;

}

/**
 * @returns TRUE if successful
 */
export function restoreOrganization(organizationID: number, reqSession: Express.SessionData): boolean {

  const db = sqlite(dbPath);

  const nowMillis = Date.now();

  const info = db.prepare("update Organizations" +
    " set recordDelete_userName = null," +
    " recordDelete_timeMillis = null," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where organizationID = ?" +
    " and recordDelete_timeMillis is not null")
    .run(
      reqSession.user.userName,
      nowMillis,
      organizationID
    );

  db.close();

  return info.changes > 0;

}

export function getInactiveOrganizations(inactiveYears: number) {

  const cutoffDate = new Date();
  cutoffDate.setFullYear(cutoffDate.getFullYear() - inactiveYears);

  const cutoffDateInteger = dateTimeFns.dateToInteger(cutoffDate);

  const db = sqlite(dbPath, {
    readonly: true
  });

  const rows: llm.Organization[] = db.prepare("select o.organizationID, o.organizationName," +
    " o.recordUpdate_timeMillis, o.recordUpdate_userName, l.licences_endDateMax" +
    " from Organizations o" +
    " left join (" +
    ("select l.organizationID, max(l.endDate) as licences_endDateMax from LotteryLicences l" +
      " where l.recordDelete_timeMillis is null" +
      " group by l.organizationID" +
      ") l on o.organizationID = l.organizationID") +
    " where o.recordDelete_timeMillis is null" +
    " and (l.licences_endDateMax is null or l.licences_endDateMax <= ?)" +
    " order by o.organizationName, o.organizationID")
    .all(cutoffDateInteger);

  db.close();

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {

    const organization = rows[rowIndex];

    organization.recordUpdate_dateString = dateTimeFns.dateToString(new Date(organization.recordUpdate_timeMillis));
    organization.licences_endDateMaxString = dateTimeFns.dateIntegerToString(organization.licences_endDateMax || 0);

  }

  return rows;

}

export function getDeletedOrganizations() {

  const addCalculatedFieldsFn = function(ele: llm.Organization) {
    ele.recordDelete_dateString = dateTimeFns.dateToString(new Date(ele.recordDelete_timeMillis));
  }

  const db = sqlite(dbPath, {
    readonly: true
  });

  const organizations: llm.Organization[] =
    db.prepare("select organizationID, organizationName, recordDelete_timeMillis, recordDelete_userName" +
      " from Organizations" +
      " where recordDelete_timeMillis is not null" +
      " order by recordDelete_timeMillis desc")
      .all();

  db.close();

  organizations.forEach(addCalculatedFieldsFn);

  return organizations;
}

/*
 * ORGANIZATION REPRESENTATIVES
 */

export function addOrganizationRepresentative(organizationID: number, reqBody: llm.OrganizationRepresentative) {

  const db = sqlite(dbPath);

  const row = db.prepare("select count(representativeIndex) as indexCount," +
    " ifnull(max(representativeIndex), -1) as maxIndex" +
    " from OrganizationRepresentatives" +
    " where organizationID = ?")
    .get(organizationID);

  const newRepresentativeIndex = row.maxIndex + 1;
  const newIsDefault = (row.indexCount === 0 ? 1 : 0);

  db.prepare("insert into OrganizationRepresentatives (" +
    "organizationID, representativeIndex," +
    " representativeName, representativeTitle," +
    " representativeAddress1, representativeAddress2," +
    " representativeCity, representativeProvince, representativePostalCode," +
    " representativePhoneNumber, representativeEmailAddress," +
    " isDefault)" +
    " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(
      organizationID, newRepresentativeIndex,
      reqBody.representativeName, reqBody.representativeTitle,
      reqBody.representativeAddress1, reqBody.representativeAddress2,
      reqBody.representativeCity, reqBody.representativeProvince, reqBody.representativePostalCode,
      reqBody.representativePhoneNumber, reqBody.representativeEmailAddress,
      newIsDefault
    );

  db.close();

  return <llm.OrganizationRepresentative>{
    organizationID: organizationID,
    representativeIndex: newRepresentativeIndex,
    representativeName: reqBody.representativeName,
    representativeTitle: reqBody.representativeTitle,
    representativeAddress1: reqBody.representativeAddress1,
    representativeAddress2: reqBody.representativeAddress2,
    representativeCity: reqBody.representativeCity,
    representativeProvince: reqBody.representativeProvince,
    representativePostalCode: reqBody.representativePostalCode,
    representativePhoneNumber: reqBody.representativePhoneNumber,
    representativeEmailAddress: reqBody.representativeEmailAddress,
    isDefault: newIsDefault === 1
  };

}

export function updateOrganizationRepresentative(organizationID: number, reqBody: llm.OrganizationRepresentative) {

  const db = sqlite(dbPath);

  db.prepare("update OrganizationRepresentatives" +
    " set representativeName = ?," +
    " representativeTitle = ?," +
    " representativeAddress1 = ?," +
    " representativeAddress2 = ?," +
    " representativeCity = ?," +
    " representativeProvince = ?," +
    " representativePostalCode = ?," +
    " representativePhoneNumber = ?," +
    " representativeEmailAddress = ?" +
    " where organizationID = ?" +
    " and representativeIndex = ?")
    .run(
      reqBody.representativeName, reqBody.representativeTitle,
      reqBody.representativeAddress1, reqBody.representativeAddress2,
      reqBody.representativeCity, reqBody.representativeProvince, reqBody.representativePostalCode,
      reqBody.representativePhoneNumber, reqBody.representativeEmailAddress,
      organizationID, reqBody.representativeIndex
    );

  db.close();

  return <llm.OrganizationRepresentative>{
    organizationID: organizationID,
    representativeIndex: reqBody.representativeIndex,
    representativeName: reqBody.representativeName,
    representativeTitle: reqBody.representativeTitle,
    representativeAddress1: reqBody.representativeAddress1,
    representativeAddress2: reqBody.representativeAddress2,
    representativeCity: reqBody.representativeCity,
    representativeProvince: reqBody.representativeProvince,
    representativePostalCode: reqBody.representativePostalCode,
    representativePhoneNumber: reqBody.representativePhoneNumber,
    representativeEmailAddress: reqBody.representativeEmailAddress,
    isDefault: Number(reqBody.isDefault) > 0
  };

}

/**
 * @returns TRUE if successful
 */
export function deleteOrganizationRepresentative(organizationID: number, representativeIndex: number) {

  const db = sqlite(dbPath);

  const info = db.prepare("delete from OrganizationRepresentatives" +
    " where organizationID = ?" +
    " and representativeIndex = ?")
    .run(organizationID, representativeIndex);

  db.close();

  return info.changes > 0;

}

export function setDefaultOrganizationRepresentative(organizationID: number, representativeIndex: number) {

  const db = sqlite(dbPath);

  db.prepare("update OrganizationRepresentatives" +
    " set isDefault = 0" +
    " where organizationID = ?")
    .run(organizationID);

  db.prepare("update OrganizationRepresentatives" +
    " set isDefault = 1" +
    " where organizationID = ?" +
    " and representativeIndex = ?")
    .run(organizationID, representativeIndex);

  db.close();

  return true;

}


/*
 * ORGANIZATION REMARKS
 */

export function getOrganizationRemarks(organizationID: number, reqSession: Express.SessionData) {

  const addCalculatedFieldsFn = function(ele: llm.OrganizationRemark) {

    ele.recordType = "remark";

    ele.remarkDateString = dateTimeFns.dateIntegerToString(ele.remarkDate || 0);
    ele.remarkTimeString = dateTimeFns.timeIntegerToString(ele.remarkTime || 0);

    ele.canUpdate = canUpdateObject(ele, reqSession);
  };

  const db = sqlite(dbPath, {
    readonly: true
  });

  const rows: llm.OrganizationRemark[] =
    db.prepare("select remarkIndex," +
      " remarkDate, remarkTime," +
      " remark, isImportant," +
      " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis" +
      " from OrganizationRemarks" +
      " where recordDelete_timeMillis is null" +
      " and organizationID = ?" +
      " order by remarkDate desc, remarkTime desc")
      .all(organizationID);

  db.close();

  rows.forEach(addCalculatedFieldsFn);

  return rows;

}

export function getOrganizationRemark(organizationID: number, remarkIndex: number, reqSession: Express.SessionData) {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const remark: llm.OrganizationRemark =
    db.prepare("select" +
      " remarkDate, remarkTime," +
      " remark, isImportant," +
      " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis" +
      " from OrganizationRemarks" +
      " where recordDelete_timeMillis is null" +
      " and organizationID = ?" +
      " and remarkIndex = ?")
      .get(organizationID, remarkIndex);

  db.close();

  remark.recordType = "remark";

  remark.remarkDateString = dateTimeFns.dateIntegerToString(remark.remarkDate || 0);
  remark.remarkTimeString = dateTimeFns.timeIntegerToString(remark.remarkTime || 0);

  remark.canUpdate = canUpdateObject(remark, reqSession);

  return remark;

}

export function addOrganizationRemark(reqBody: llm.OrganizationRemark, reqSession: Express.SessionData) {

  const db = sqlite(dbPath);

  const row = db.prepare("select ifnull(max(remarkIndex), -1) as maxIndex" +
    " from OrganizationRemarks" +
    " where organizationID = ?")
    .get(reqBody.organizationID);

  const newRemarkIndex = row.maxIndex + 1;

  const rightNow = new Date();

  const remarkDate = dateTimeFns.dateToInteger(rightNow);
  const remarkTime = dateTimeFns.dateToTimeInteger(rightNow);

  db.prepare("insert into OrganizationRemarks (" +
    "organizationID, remarkIndex," +
    " remarkDate, remarkTime, remark, isImportant," +
    " recordCreate_userName, recordCreate_timeMillis," +
    " recordUpdate_userName, recordUpdate_timeMillis)" +
    " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(
      reqBody.organizationID, newRemarkIndex,
      remarkDate, remarkTime,
      reqBody.remark, 0,
      reqSession.user.userName,
      rightNow.getTime(),
      reqSession.user.userName,
      rightNow.getTime()
    );

  db.close();

  return Number(newRemarkIndex);

}

/**
 * @returns TRUE if successful
 */
export function updateOrganizationRemark(reqBody: llm.OrganizationRemark, reqSession: Express.SessionData) {

  const db = sqlite(dbPath);

  const nowMillis = Date.now();

  const info = db.prepare("update OrganizationRemarks" +
    " set remarkDate = ?," +
    " remarkTime = ?," +
    " remark = ?," +
    " isImportant = ?," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where organizationID = ?" +
    " and remarkIndex = ?" +
    " and recordDelete_timeMillis is null")
    .run(
      dateTimeFns.dateStringToInteger(reqBody.remarkDateString),
      dateTimeFns.timeStringToInteger(reqBody.remarkTimeString),
      reqBody.remark,
      reqBody.isImportant ? 1 : 0,
      reqSession.user.userName,
      nowMillis,
      reqBody.organizationID,
      reqBody.remarkIndex
    );

  db.close();

  return info.changes > 0;

}

/**
 * @returns TRUE if successful
 */
export function deleteOrganizationRemark(organizationID: number, remarkIndex: number, reqSession: Express.SessionData) {

  const db = sqlite(dbPath);

  const nowMillis = Date.now();

  const info = db.prepare("update OrganizationRemarks" +
    " set recordDelete_userName = ?," +
    " recordDelete_timeMillis = ?" +
    " where organizationID = ?" +
    " and remarkIndex = ?" +
    " and recordDelete_timeMillis is null")
    .run(
      reqSession.user.userName,
      nowMillis,
      organizationID,
      remarkIndex
    );

  db.close();

  return info.changes > 0;

}


/*
 * ORGANIZATION BANK RECORDS
 */

export function getOrganizationBankRecords(organizationID: number, accountNumber: string, bankingYear: number) {

  const addCalculatedFieldsFn = function(ele: llm.OrganizationBankRecord) {
    ele.recordDateString = dateTimeFns.dateIntegerToString(ele.recordDate);
  };

  const db = sqlite(dbPath, {
    readonly: true
  });

  const rows: llm.OrganizationBankRecord[] =
    db.prepare("select recordIndex," +
      " bankingMonth, bankRecordType," +
      " recordDate, recordNote, recordIsNA," +
      " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis" +
      " from OrganizationBankRecords" +
      " where recordDelete_timeMillis is null" +
      " and organizationID = ?" +
      " and accountNumber = ?" +
      " and bankingYear = ?")
      .all(organizationID, accountNumber, bankingYear);

  db.close();

  rows.forEach(addCalculatedFieldsFn);

  return rows;

}

export function getOrganizationBankRecordStats(organizationID: number) {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const rows = db.prepare("select accountNumber," +
    " min(bankingYear) as bankingYearMin," +
    " max(bankingYear) as bankingYearMax" +
    " from OrganizationBankRecords" +
    " where recordDelete_timeMillis is null" +
    " and organizationID = ?" +
    " group by accountNumber" +
    " order by bankingYearMax desc, accountNumber")

    .all(organizationID);

  db.close();

  return rows;
}

export function addOrganizationBankRecord(reqBody: llm.OrganizationBankRecord, reqSession: Express.Session) {

  // Check for a record with the same unique key

  const db = sqlite(dbPath);

  const record = db.prepare("select recordIndex, recordDelete_timeMillis" +
    " from OrganizationBankRecords" +
    " where organizationID = ?" +
    " and accountNumber = ?" +
    " and bankingYear = ?" +
    " and bankingMonth = ?" +
    " and bankRecordType = ?")
    .get(reqBody.organizationID,
      reqBody.accountNumber,
      reqBody.bankingYear,
      reqBody.bankingMonth,
      reqBody.bankRecordType);

  if (record) {

    if (record.recordDelete_timeMillis) {

      const info = db.prepare("delete from OrganizationBankRecords" +
        " where organizationID = ?" +
        " and recordIndex = ?")
        .run(reqBody.organizationID, record.recordIndex);

      if (info.changes === 0) {

        // Record not deleted
        db.close();
        return false;

      }

    } else {

      // An active record already exists
      db.close();
      return false;

    }

  }

  // Get next recordIndex

  const row = db.prepare("select ifnull(max(recordIndex), -1) as maxIndex" +
    " from OrganizationBankRecords" +
    " where organizationID = ?")
    .get(reqBody.organizationID);

  const newRecordIndex = row.maxIndex + 1;

  // Insert the record

  const nowMillis = Date.now();

  const info = db.prepare("insert into OrganizationBankRecords" +
    " (organizationID, recordIndex," +
    " accountNumber, bankingYear, bankingMonth, bankRecordType, recordIsNA, recordDate, recordNote," +
    " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
    " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(reqBody.organizationID,
      newRecordIndex,
      reqBody.accountNumber,
      reqBody.bankingYear,
      reqBody.bankingMonth,
      reqBody.bankRecordType,
      reqBody.recordIsNA || 0,
      dateTimeFns.dateStringToInteger(reqBody.recordDateString),
      reqBody.recordNote,
      reqSession.user.userName,
      nowMillis,
      reqSession.user.userName,
      nowMillis
    );

  db.close();

  return info.changes > 0;

}

export function updateOrganizationBankRecord(reqBody: llm.OrganizationBankRecord, reqSession: Express.Session) {

  const db = sqlite(dbPath);

  const nowMillis = Date.now();

  const info = db.prepare("update OrganizationBankRecords" +
    " set recordDate = ?," +
    " recordIsNA = ?," +
    " recordNote = ?," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where organizationID = ?" +
    " and recordIndex = ?" +
    " and recordDelete_timeMillis is null")
    .run(
      dateTimeFns.dateStringToInteger(reqBody.recordDateString),
      reqBody.recordIsNA || 0,
      reqBody.recordNote,
      reqSession.user.userName,
      nowMillis,
      reqBody.organizationID,
      reqBody.recordIndex
    );

  db.close();

  return info.changes > 0;

}

export function deleteOrganizationBankRecord(organizationID: number, recordIndex: number, reqSession: Express.Session) {

  const db = sqlite(dbPath);

  const nowMillis = Date.now();

  const info = db.prepare("update OrganizationBankRecords" +
    " set recordDelete_userName = ?," +
    " recordDelete_timeMillis = ?" +
    " where organizationID = ?" +
    " and recordIndex = ?" +
    " and recordDelete_timeMillis is null")
    .run(
      reqSession.user.userName,
      nowMillis,
      organizationID,
      recordIndex
    );

  db.close();

  return info.changes > 0;

}


/*
 * LICENCES
 */

let licenceTableStats: llm.LotteryLicenceStats = {
  applicationYearMin: 1990,
  startYearMin: 1990,
  endYearMax: new Date().getFullYear() + 1
};

let licenceTableStatsExpiryMillis = -1;

export function getLicenceTableStats() {

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

}

export function getLicences(reqBodyOrParamsObj: any, reqSession: Express.SessionData, includeOptions: {
  includeOrganization: boolean,
  limit: number,
  offset?: number
}) {

  if (reqBodyOrParamsObj.organizationName && reqBodyOrParamsObj.organizationName !== "") {
    includeOptions.includeOrganization = true;
  }

  const addCalculatedFieldsFn = function(ele: llm.LotteryLicence) {

    ele.recordType = "licence";

    ele.applicationDateString = dateTimeFns.dateIntegerToString(ele.applicationDate || 0);

    ele.startDateString = dateTimeFns.dateIntegerToString(ele.startDate || 0);
    ele.endDateString = dateTimeFns.dateIntegerToString(ele.endDate || 0);

    ele.startTimeString = dateTimeFns.timeIntegerToString(ele.startTime || 0);
    ele.endTimeString = dateTimeFns.timeIntegerToString(ele.endTime || 0);

    ele.issueDateString = dateTimeFns.dateIntegerToString(ele.issueDate || 0);

    ele.locationDisplayName =
      (ele.locationName === "" ? ele.locationAddress1 : ele.locationName);

    ele.canUpdate = canUpdateObject(ele, reqSession);
  };

  const db = sqlite(dbPath, {
    readonly: true
  });

  // build where clause

  const sqlParams = [];

  let sqlWhereClause = " where l.recordDelete_timeMillis is null";

  if (reqBodyOrParamsObj.organizationID && reqBodyOrParamsObj.organizationID !== "") {

    sqlWhereClause += " and l.organizationID = ?";
    sqlParams.push(reqBodyOrParamsObj.organizationID);

  }

  if (reqBodyOrParamsObj.organizationName && reqBodyOrParamsObj.organizationName !== "") {

    const organizationNamePieces = reqBodyOrParamsObj.organizationName.toLowerCase().split(" ");

    for (let pieceIndex = 0; pieceIndex < organizationNamePieces.length; pieceIndex += 1) {

      sqlWhereClause += " and instr(lower(o.organizationName), ?)";
      sqlParams.push(organizationNamePieces[pieceIndex]);

    }

  }

  if (reqBodyOrParamsObj.licenceTypeKey && reqBodyOrParamsObj.licenceTypeKey !== "") {

    sqlWhereClause += " and l.licenceTypeKey = ?";
    sqlParams.push(reqBodyOrParamsObj.licenceTypeKey);

  }

  if (reqBodyOrParamsObj.licenceStatus) {

    if (reqBodyOrParamsObj.licenceStatus === "past") {

      sqlWhereClause += " and l.endDate < ?";
      sqlParams.push(dateTimeFns.dateToInteger(new Date()));

    } else if (reqBodyOrParamsObj.licenceStatus === "active") {

      sqlWhereClause += " and l.endDate >= ?";
      sqlParams.push(dateTimeFns.dateToInteger(new Date()));

    }

  }

  if (reqBodyOrParamsObj.locationID) {

    sqlWhereClause += " and (l.locationID = ?" +
      " or l.licenceID in (" +
      "select licenceID from LotteryLicenceTicketTypes" +
      " where recordDelete_timeMillis is null and (distributorLocationID = ? or manufacturerLocationID = ?)" +
      ")" +
      ")";

    sqlParams.push(reqBodyOrParamsObj.locationID);
    sqlParams.push(reqBodyOrParamsObj.locationID);
    sqlParams.push(reqBodyOrParamsObj.locationID);

  }

  // if a limit is used, get the count

  let count = 0;

  if (includeOptions.limit !== -1) {

    count = db.prepare("select ifnull(count(*), 0) as cnt" +
      " from LotteryLicences l" +
      " left join Organizations o on l.organizationID = o.organizationID" +
      sqlWhereClause)
      .get(sqlParams)
      .cnt;
  }

  let sql = "select l.licenceID, l.organizationID," +
    (includeOptions.includeOrganization ?
      " o.organizationName," :
      "") +
    " l.applicationDate, l.licenceTypeKey," +
    " l.startDate, l.startTime, l.endDate, l.endTime," +
    " l.locationID, lo.locationName, lo.locationAddress1," +
    " l.municipality, l.licenceDetails, l.termsConditions," +
    " l.externalLicenceNumber, l.issueDate," +
    " l.recordCreate_userName, l.recordCreate_timeMillis, l.recordUpdate_userName, l.recordUpdate_timeMillis" +
    " from LotteryLicences l" +
    " left join Locations lo on l.locationID = lo.locationID" +
    (includeOptions.includeOrganization ?
      " left join Organizations o on l.organizationID = o.organizationID" :
      ""
    ) +
    sqlWhereClause +
    " order by l.endDate desc, l.startDate desc, l.licenceID";

  if (includeOptions.limit !== -1) {

    sql += " limit " + includeOptions.limit + " offset " + includeOptions.offset;

  }

  const rows: llm.LotteryLicence[] =
    db.prepare(sql)
      .all(sqlParams);

  db.close();

  rows.forEach(addCalculatedFieldsFn);

  return {
    count: (includeOptions.limit === -1 ? rows.length : count),
    licences: rows
  };

}

export function getLicence(licenceID: number, reqSession: Express.SessionData): llm.LotteryLicence {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const licenceObj = getLicenceWithDB(db, licenceID, reqSession, {
    includeTicketTypes: true,
    includeFields: true,
    includeEvents: true,
    includeAmendments: true,
    includeTransactions: true
  });

  db.close();

  return licenceObj;

}

export function getNextExternalLicenceNumberFromRange() {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const rangeStart = parseInt(getApplicationSettingWithDB(db, "licences.externalLicenceNumber.range.start") || "-1");

  const rangeEnd = parseInt(getApplicationSettingWithDB(db, "licences.externalLicenceNumber.range.end") || "0");

  const row = db.prepare("select max(externalLicenceNumberInteger) as maxExternalLicenceNumberInteger" +
    " from LotteryLicences" +
    " where externalLicenceNumberInteger >= ?" +
    " and externalLicenceNumberInteger <= ?")
    .get(rangeStart, rangeEnd);

  db.close();

  if (!row) {

    return rangeStart;

  }

  const maxExternalLicenceNumber = row.maxExternalLicenceNumberInteger;

  if (!maxExternalLicenceNumber) {

    return rangeStart;

  }

  const newExternalLicenceNumber = maxExternalLicenceNumber + 1;

  if (newExternalLicenceNumber > rangeEnd) {

    return -1;

  }

  return Number(newExternalLicenceNumber);

}

/**
 * @returns New licenceID
 */
export function createLicence(reqBody: any, reqSession: Express.SessionData) {

  const db = sqlite(dbPath);

  const nowMillis = Date.now();

  let externalLicenceNumberInteger = -1;

  try {

    externalLicenceNumberInteger = parseInt(reqBody.externalLicenceNumber);

  } catch (e) {

    externalLicenceNumberInteger = -1;

  }

  const info = db.prepare("insert into LotteryLicences (" +
    "organizationID, applicationDate, licenceTypeKey," +
    " startDate, endDate, startTime, endTime," +
    " locationID, municipality, licenceDetails, termsConditions, totalPrizeValue," +
    " externalLicenceNumber, externalLicenceNumberInteger," +
    " recordCreate_userName, recordCreate_timeMillis," +
    " recordUpdate_userName, recordUpdate_timeMillis)" +
    " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(
      reqBody.organizationID,
      dateTimeFns.dateStringToInteger(reqBody.applicationDateString),
      reqBody.licenceTypeKey,
      dateTimeFns.dateStringToInteger(reqBody.startDateString),
      dateTimeFns.dateStringToInteger(reqBody.endDateString),
      dateTimeFns.timeStringToInteger(reqBody.startTimeString),
      dateTimeFns.timeStringToInteger(reqBody.endTimeString),
      (reqBody.locationID === "" ? null : reqBody.locationID),
      reqBody.municipality,
      reqBody.licenceDetails,
      reqBody.termsConditions,
      reqBody.totalPrizeValue,
      reqBody.externalLicenceNumber,
      externalLicenceNumberInteger,
      reqSession.user.userName,
      nowMillis,
      reqSession.user.userName,
      nowMillis
    );

  const licenceID: number = Number(info.lastInsertRowid);

  // Fields

  const fieldKeys = reqBody.fieldKeys.substring(1).split(",");

  for (let fieldIndex = 0; fieldIndex < fieldKeys.length; fieldIndex += 1) {

    const fieldKey = fieldKeys[fieldIndex];
    const fieldValue = reqBody[fieldKey];

    if (fieldKey === "" || fieldValue === "") {

      continue;

    }

    db.prepare("insert into LotteryLicenceFields" +
      " (licenceID, fieldKey, fieldValue)" +
      " values (?, ?, ?)")
      .run(licenceID, fieldKey, fieldValue);

  }

  // Ticket types

  if (typeof (reqBody.ticketType_ticketType) === "string") {

    db.prepare("insert into LotteryLicenceTicketTypes (" +
      "licenceID, ticketType," +
      " distributorLocationID, manufacturerLocationID," +
      " unitCount, licenceFee," +
      " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
      " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run(
        licenceID,
        reqBody.ticketType_ticketType,
        (reqBody.ticketType_distributorLocationID === "" ? null : reqBody.ticketType_distributorLocationID),
        (reqBody.ticketType_manufacturerLocationID === "" ? null : reqBody.ticketType_manufacturerLocationID),
        reqBody.ticketType_unitCount,
        reqBody.ticketType_licenceFee,
        reqSession.user.userName,
        nowMillis,
        reqSession.user.userName,
        nowMillis
      );

  } else if (typeof (reqBody.ticketType_ticketType) === "object") {

    for (let ticketTypeIndex = 0; ticketTypeIndex < reqBody.ticketType_ticketType.length; ticketTypeIndex += 1) {

      db.prepare("insert into LotteryLicenceTicketTypes (" +
        "licenceID, ticketType," +
        " distributorLocationID, manufacturerLocationID," +
        " unitCount, licenceFee," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(
          licenceID,
          reqBody.ticketType_ticketType[ticketTypeIndex],

          (reqBody.ticketType_distributorLocationID[ticketTypeIndex] === "" ?
            null :
            reqBody.ticketType_distributorLocationID[ticketTypeIndex]),

          (reqBody.ticketType_manufacturerLocationID[ticketTypeIndex] === "" ?
            null :
            reqBody.ticketType_manufacturerLocationID[ticketTypeIndex]),

          reqBody.ticketType_unitCount[ticketTypeIndex],
          reqBody.ticketType_licenceFee[ticketTypeIndex],
          reqSession.user.userName,
          nowMillis,
          reqSession.user.userName,
          nowMillis
        );

    }

  }

  // Events

  if (typeof (reqBody.eventDate) === "string") {

    db.prepare("insert into LotteryEvents (" +
      "licenceID, eventDate," +
      " recordCreate_userName, recordCreate_timeMillis," +
      " recordUpdate_userName, recordUpdate_timeMillis)" +
      " values (?, ?, ?, ?, ?, ?)")
      .run(
        licenceID,
        dateTimeFns.dateStringToInteger(reqBody.eventDate),
        reqSession.user.userName,
        nowMillis,
        reqSession.user.userName,
        nowMillis
      );

  } else if (typeof (reqBody.eventDate) === "object") {

    for (let eventIndex = 0; eventIndex < reqBody.eventDate.length; eventIndex += 1) {

      db.prepare("insert or ignore into LotteryEvents (" +
        "licenceID, eventDate," +
        " recordCreate_userName, recordCreate_timeMillis," +
        " recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?)")
        .run(
          licenceID,
          dateTimeFns.dateStringToInteger(reqBody.eventDate[eventIndex]),
          reqSession.user.userName,
          nowMillis,
          reqSession.user.userName,
          nowMillis
        );

    }

  }

  // Calculate licence fee

  const licenceObj = getLicenceWithDB(db, licenceID, reqSession, {
    includeTicketTypes: true,
    includeFields: true,
    includeEvents: true,
    includeAmendments: true,
    includeTransactions: true
  });

  const feeCalculation = configFns.getProperty("licences.feeCalculationFn")(licenceObj);

  db.prepare("update LotteryLicences" +
    " set licenceFee = ?" +
    " where licenceID = ?")
    .run(feeCalculation.fee, licenceID);

  db.close();

  // Reset the cached stats
  licenceTableStatsExpiryMillis = -1;

  return licenceID;

}

/**
 * @returns TRUE if successful
 */
export function updateLicence(reqBody: any, reqSession: Express.SessionData): boolean {

  // Check if can update

  const db = sqlite(dbPath);

  const pastLicenceObj = getLicenceWithDB(db, reqBody.licenceID, reqSession, {
    includeTicketTypes: true,
    includeFields: true,
    includeEvents: true,
    includeAmendments: false,
    includeTransactions: true
  });

  if (!pastLicenceObj.canUpdate) {

    db.close();
    return false;

  }

  const nowMillis = Date.now();

  // Get integer version of external licence number for indexing

  let externalLicenceNumberInteger = -1;

  try {

    externalLicenceNumberInteger = parseInt(reqBody.externalLicenceNumber);

  } catch (e) {

    externalLicenceNumberInteger = -1;

  }

  // Update licence

  const startDate_now = dateTimeFns.dateStringToInteger(reqBody.startDateString);
  const endDate_now = dateTimeFns.dateStringToInteger(reqBody.endDateString);
  const startTime_now = dateTimeFns.timeStringToInteger(reqBody.startTimeString);
  const endTime_now = dateTimeFns.timeStringToInteger(reqBody.endTimeString);

  const info = db.prepare("update LotteryLicences" +
    " set organizationID = ?," +
    " applicationDate = ?," +
    " licenceTypeKey = ?," +
    " startDate = ?," +
    " endDate = ?," +
    " startTime = ?," +
    " endTime = ?," +
    " locationID = ?," +
    " municipality = ?," +
    " licenceDetails = ?," +
    " termsConditions = ?," +
    " totalPrizeValue = ?," +
    " licenceFee = ?," +
    " externalLicenceNumber = ?," +
    " externalLicenceNumberInteger = ?," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where licenceID = ?" +
    " and recordDelete_timeMillis is null")
    .run(
      reqBody.organizationID,
      dateTimeFns.dateStringToInteger(reqBody.applicationDateString),
      reqBody.licenceTypeKey,
      startDate_now,
      endDate_now,
      startTime_now,
      endTime_now,
      (reqBody.locationID === "" ? null : reqBody.locationID),
      reqBody.municipality,
      reqBody.licenceDetails,
      reqBody.termsConditions,
      reqBody.totalPrizeValue,
      reqBody.licenceFee,
      reqBody.externalLicenceNumber,
      externalLicenceNumberInteger,
      reqSession.user.userName,
      nowMillis,
      reqBody.licenceID
    );

  const changeCount = info.changes;

  if (!changeCount) {

    db.close();

    return false;

  }

  // Record amendments (if necessary)

  if (pastLicenceObj.trackUpdatesAsAmendments) {

    if (configFns.getProperty("amendments.trackDateTimeUpdate") &&
      (pastLicenceObj.startDate !== startDate_now ||
        pastLicenceObj.endDate !== endDate_now ||
        pastLicenceObj.startTime !== startTime_now ||
        pastLicenceObj.endTime !== endTime_now)) {

      const amendment = (
        (pastLicenceObj.startDate !== startDate_now ?
          `Start Date: ${pastLicenceObj.startDate} -> ${startDate_now}` + "\n " :
          "") +
        (pastLicenceObj.endDate !== endDate_now ?
          `End Date: ${pastLicenceObj.endDate} -> ${endDate_now}` + "\n" :
          "") +
        (pastLicenceObj.startTime !== startTime_now ?
          `Start Time: ${pastLicenceObj.startTime} -> ${startTime_now}` + "\n" :
          "") +
        (pastLicenceObj.endTime !== endTime_now ?
          `End Time: ${pastLicenceObj.endTime} -> ${endTime_now}` + "\n" :
          "")).trim();

      addLicenceAmendmentWithDB(
        db,
        reqBody.licenceID,
        "Date Update",
        amendment,
        0,
        reqSession
      );

    }

    if (pastLicenceObj.organizationID !== parseInt(reqBody.organizationID) &&
      configFns.getProperty("amendments.trackOrganizationUpdate")) {

      addLicenceAmendmentWithDB(
        db,
        reqBody.licenceID,
        "Organization Change",
        "",
        0,
        reqSession
      );

    }

    if (pastLicenceObj.locationID !== parseInt(reqBody.locationID) &&
      configFns.getProperty("amendments.trackLocationUpdate")) {

      addLicenceAmendmentWithDB(
        db,
        reqBody.licenceID,
        "Location Change",
        "",
        0,
        reqSession
      );

    }

    if (pastLicenceObj.licenceFee !== parseFloat(reqBody.licenceFee) &&
      configFns.getProperty("amendments.trackLicenceFeeUpdate")) {

      addLicenceAmendmentWithDB(
        db,
        reqBody.licenceID,
        "Licence Fee Change",
        "$" + pastLicenceObj.licenceFee.toFixed(2) + " -> $" + parseFloat(reqBody.licenceFee).toFixed(2),
        0,
        reqSession
      );

    }

  }

  /*
   * Fields
   */

  db.prepare("delete from LotteryLicenceFields" +
    " where licenceID = ?")
    .run(reqBody.licenceID);

  const fieldKeys = reqBody.fieldKeys.substring(1).split(",");

  for (let fieldIndex = 0; fieldIndex < fieldKeys.length; fieldIndex += 1) {

    const fieldKey = fieldKeys[fieldIndex];
    const fieldValue = reqBody[fieldKey];

    if (fieldKey === "" || fieldValue === "") {

      continue;

    }

    db.prepare("insert into LotteryLicenceFields" +
      " (licenceID, fieldKey, fieldValue)" +
      " values (?, ?, ?)")
      .run(reqBody.licenceID, fieldKey, fieldValue);

  }

  /*
   * Ticket types
   */

  // Do deletes

  if (typeof (reqBody.ticketType_toDelete) === "string") {

    db.prepare("update LotteryLicenceTicketTypes" +
      " set recordDelete_userName = ?," +
      " recordDelete_timeMillis = ?" +
      " where licenceID = ?" +
      " and ticketType = ?")
      .run(
        reqSession.user.userName,
        nowMillis,
        reqBody.licenceID,
        reqBody.ticketType_toDelete
      );

    if (pastLicenceObj.trackUpdatesAsAmendments &&
      configFns.getProperty("amendments.trackTicketTypeDelete")) {

      addLicenceAmendmentWithDB(
        db,
        reqBody.licenceID,
        "Ticket Type Removed",
        "Removed " + reqBody.ticketType_toDelete + ".",
        0,
        reqSession
      );

    }

  } else if (typeof (reqBody.ticketType_toDelete) === "object") {

    for (let deleteIndex = 0; deleteIndex < reqBody.ticketType_toDelete.length; deleteIndex += 1) {

      db.prepare("update LotteryLicenceTicketTypes" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where licenceID = ?" +
        " and ticketType = ?")
        .run(
          reqSession.user.userName,
          nowMillis,
          reqBody.licenceID,
          reqBody.ticketType_toDelete[deleteIndex]
        );

      if (pastLicenceObj.trackUpdatesAsAmendments &&
        configFns.getProperty("amendments.trackTicketTypeDelete")) {

        addLicenceAmendmentWithDB(
          db,
          reqBody.licenceID,
          "Ticket Type Removed",
          "Removed " + reqBody.ticketType_toDelete[deleteIndex] + ".",
          0,
          reqSession
        );

      }

    }

  }

  // Do adds

  if (typeof (reqBody.ticketType_toAdd) === "string") {

    const addInfo = db
      .prepare("update LotteryLicenceTicketTypes" +
        " set costs_receipts = null," +
        " costs_admin = null," +
        " costs_prizesAwarded = null," +
        " recordDelete_userName = null," +
        " recordDelete_timeMillis = null," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where licenceID = ?" +
        " and ticketType = ?" +
        " and recordDelete_timeMillis is not null")
      .run(
        reqSession.user.userName,
        nowMillis,
        reqBody.licenceID,
        reqBody.ticketType_toAdd
      );

    if (addInfo.changes === 0) {

      db.prepare("insert or ignore into LotteryLicenceTicketTypes" +
        " (licenceID, ticketType, unitCount," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?)")
        .run(
          reqBody.licenceID,
          reqBody.ticketType_toAdd,
          0,
          reqSession.user.userName,
          nowMillis,
          reqSession.user.userName,
          nowMillis
        );

    }

    if (pastLicenceObj.trackUpdatesAsAmendments &&
      configFns.getProperty("amendments.trackTicketTypeNew")) {

      addLicenceAmendmentWithDB(
        db,
        reqBody.licenceID,
        "New Ticket Type",
        "Added " + reqBody.ticketType_toAdd + ".",
        0,
        reqSession
      );

    }

  } else if (typeof (reqBody.ticketType_toAdd) === "object") {

    for (let addIndex = 0; addIndex < reqBody.ticketType_toAdd.length; addIndex += 1) {

      const addInfo = db.prepare("update LotteryLicenceTicketTypes" +
        " set costs_receipts = null," +
        " costs_admin = null," +
        " costs_prizesAwarded = null," +
        " recordDelete_userName = null," +
        " recordDelete_timeMillis = null," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where licenceID = ?" +
        " and ticketType = ?" +
        " and recordDelete_timeMillis is not null")
        .run(
          reqSession.user.userName,
          nowMillis,
          reqBody.licenceID,
          reqBody.ticketType_toAdd[addIndex]
        );

      if (addInfo.changes === 0) {

        db.prepare("insert or ignore into LotteryLicenceTicketTypes" +
          " (licenceID, ticketType, unitCount," +
          " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
          " values (?, ?, ?, ?, ?, ?, ?)")
          .run(
            reqBody.licenceID,
            reqBody.ticketType_toAdd[addIndex],
            0,
            reqSession.user.userName,
            nowMillis,
            reqSession.user.userName,
            nowMillis
          );

      }

      if (pastLicenceObj.trackUpdatesAsAmendments &&
        configFns.getProperty("amendments.trackTicketTypeNew")) {

        addLicenceAmendmentWithDB(
          db,
          reqBody.licenceID,
          "New Ticket Type",
          "Added " + reqBody.ticketType_toAdd[addIndex] + ".",
          0,
          reqSession
        );

      }

    }

  }

  // Do updates

  if (typeof (reqBody.ticketType_ticketType) === "string") {

    db.prepare("update LotteryLicenceTicketTypes" +
      " set distributorLocationID = ?," +
      " manufacturerLocationID = ?," +
      " unitCount = ?," +
      " licenceFee = ?," +
      " recordUpdate_userName = ?," +
      " recordUpdate_timeMillis = ?" +
      " where licenceID = ?" +
      " and ticketType = ?" +
      " and recordDelete_timeMillis is null")
      .run(
        (reqBody.ticketType_distributorLocationID === "" ? null : reqBody.ticketType_distributorLocationID),
        (reqBody.ticketType_manufacturerLocationID === "" ? null : reqBody.ticketType_manufacturerLocationID),
        reqBody.ticketType_unitCount,
        reqBody.ticketType_licenceFee,
        reqSession.user.userName,
        nowMillis,
        reqBody.licenceID,
        reqBody.ticketType_ticketType
      );

    if (pastLicenceObj.trackUpdatesAsAmendments) {

      const ticketTypeObj_past =
        pastLicenceObj.licenceTicketTypes.find(ele => ele.ticketType === reqBody.ticketType_ticketType);

      if (ticketTypeObj_past &&
        configFns.getProperty("amendments.trackTicketTypeUpdate") &&
        ticketTypeObj_past.unitCount !== parseInt(reqBody.ticketType_unitCount)) {

        addLicenceAmendmentWithDB(
          db,
          reqBody.licenceID,
          "Ticket Type Change",
          (reqBody.ticketType_ticketType + " Units: " +
            ticketTypeObj_past.unitCount + " -> " + reqBody.ticketType_unitCount),
          0,
          reqSession
        );

      }

    }

  } else if (typeof (reqBody.ticketType_ticketType) === "object") {

    for (let ticketTypeIndex = 0; ticketTypeIndex < reqBody.ticketType_ticketType.length; ticketTypeIndex += 1) {

      db.prepare("update LotteryLicenceTicketTypes" +
        " set distributorLocationID = ?," +
        " manufacturerLocationID = ?," +
        " unitCount = ?," +
        " licenceFee = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where licenceID = ?" +
        " and ticketType = ?" +
        " and recordDelete_timeMillis is null")
        .run(
          (reqBody.ticketType_distributorLocationID[ticketTypeIndex] === "" ?
            null :
            reqBody.ticketType_distributorLocationID[ticketTypeIndex]),

          (reqBody.ticketType_manufacturerLocationID[ticketTypeIndex] === "" ?
            null :
            reqBody.ticketType_manufacturerLocationID[ticketTypeIndex]),

          reqBody.ticketType_unitCount[ticketTypeIndex],
          reqBody.ticketType_licenceFee[ticketTypeIndex],
          reqSession.user.userName,
          nowMillis,
          reqBody.licenceID,
          reqBody.ticketType_ticketType[ticketTypeIndex]
        );

      if (pastLicenceObj.trackUpdatesAsAmendments) {

        const ticketTypeObj_past =
          pastLicenceObj.licenceTicketTypes.find(ele => ele.ticketType === reqBody.ticketType_ticketType[ticketTypeIndex]);

        if (ticketTypeObj_past &&
          configFns.getProperty("amendments.trackTicketTypeUpdate") &&
          ticketTypeObj_past.unitCount !== parseInt(reqBody.ticketType_unitCount[ticketTypeIndex])) {

          addLicenceAmendmentWithDB(
            db,
            reqBody.licenceID,
            "Ticket Type Change",
            (reqBody.ticketType_ticketType[ticketTypeIndex] + " Units: " +
              ticketTypeObj_past.unitCount + " -> " + reqBody.ticketType_unitCount[ticketTypeIndex]),
            0,
            reqSession
          );

        }

      }

    }

  }

  // Events

  if (typeof (reqBody.eventDate) !== "undefined") {

    // Purge any deleted events to avoid conflicts

    db.prepare("delete from LotteryEventFields" +
      " where licenceID = ?" +
      (" and eventDate in (" +
        "select eventDate from LotteryEvents where licenceID = ? and recordDelete_timeMillis is not null" +
        ")"))
      .run(reqBody.licenceID, reqBody.licenceID);

    db.prepare("delete from LotteryEvents" +
      " where licenceID = ?" +
      " and recordDelete_timeMillis is not null")
      .run(reqBody.licenceID);

  }

  if (typeof (reqBody.eventDate) === "string") {

    db.prepare("insert or ignore into LotteryEvents (" +
      "licenceID, eventDate," +
      " recordCreate_userName, recordCreate_timeMillis," +
      " recordUpdate_userName, recordUpdate_timeMillis)" +
      " values (?, ?, ?, ?, ?, ?)")
      .run(
        reqBody.licenceID,
        dateTimeFns.dateStringToInteger(reqBody.eventDate),
        reqSession.user.userName,
        nowMillis,
        reqSession.user.userName,
        nowMillis
      );

  } else if (typeof (reqBody.eventDate) === "object") {

    for (let eventIndex = 0; eventIndex < reqBody.eventDate.length; eventIndex += 1) {

      db.prepare("insert or ignore into LotteryEvents (" +
        "licenceID, eventDate," +
        " recordCreate_userName, recordCreate_timeMillis," +
        " recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?)")
        .run(
          reqBody.licenceID,
          dateTimeFns.dateStringToInteger(reqBody.eventDate[eventIndex]),
          reqSession.user.userName,
          nowMillis,
          reqSession.user.userName,
          nowMillis
        );

    }

  }

  db.close();

  // Reset the cached stats
  licenceTableStatsExpiryMillis = -1;
  eventTableStatsExpiryMillis = -1;

  return changeCount > 0;

}

export function deleteLicence(licenceID: number, reqSession: Express.SessionData) {

  const db = sqlite(dbPath);

  const nowMillis = Date.now();

  const info = db.prepare("update LotteryLicences" +
    " set recordDelete_userName = ?," +
    " recordDelete_timeMillis = ?" +
    " where licenceID = ?" +
    " and recordDelete_timeMillis is null")
    .run(
      reqSession.user.userName,
      nowMillis,
      licenceID
    );

  const changeCount = info.changes;

  if (changeCount) {

    db.prepare("update LotteryEvents" +
      " set recordDelete_userName = ?," +
      " recordDelete_timeMillis = ?" +
      " where licenceID = ?" +
      " and recordDelete_timeMillis is null")
      .run(
        reqSession.user.userName,
        nowMillis,
        licenceID
      );

  }

  db.close();

  // Reset the cached stats
  licenceTableStatsExpiryMillis = -1;
  eventTableStatsExpiryMillis = -1;

  return changeCount > 0;

}

export function getDistinctTermsConditions(organizationID: number) {

  const addCalculatedFieldsFn = function(ele: llm.TermsConditionsStat) {
    ele.startDateMaxString = dateTimeFns.dateIntegerToString(ele.startDateMax);
  };

  const db = sqlite(dbPath, {
    readonly: true
  });

  const rows: llm.TermsConditionsStat[] = db.prepare("select termsConditions," +
    " count(licenceID) as termsConditionsCount," +
    " max(startDate) as startDateMax" +
    " from LotteryLicences l" +
    " where l.organizationID = ?" +
    " and l.termsConditions is not null and trim(l.termsConditions) <> ''" +
    " and l.recordDelete_timeMillis is null" +
    " group by l.termsConditions" +
    " order by startDateMax desc")
    .all(organizationID);

  db.close();

  rows.forEach(addCalculatedFieldsFn);

  return rows;

}

/**
 * @returns TRUE if successful
 */
export function pokeLicence(licenceID: number, reqSession: Express.SessionData) {

  const db = sqlite(dbPath);

  const nowMillis = Date.now();

  const info = db.prepare("update LotteryLicences" +
    " set recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where licenceID = ?" +
    " and recordDelete_timeMillis is null")
    .run(
      reqSession.user.userName,
      nowMillis,
      licenceID
    );

  db.close();

  return info.changes > 0;

}

/**
 * @returns TRUE if successful
 */
export function issueLicence(licenceID: number, reqSession: Express.SessionData) {

  const db = sqlite(dbPath);

  const nowDate = new Date();

  const issueDate = dateTimeFns.dateToInteger(nowDate);
  const issueTime = dateTimeFns.dateToTimeInteger(nowDate);

  const info = db.prepare("update LotteryLicences" +
    " set issueDate = ?," +
    " issueTime = ?," +
    " trackUpdatesAsAmendments = 1," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where licenceID = ?" +
    " and recordDelete_timeMillis is null" +
    " and issueDate is null")
    .run(
      issueDate,
      issueTime,
      reqSession.user.userName,
      nowDate.getTime(),
      licenceID
    );

  db.close();

  return info.changes > 0;

}

/**
 * @returns TRUE if successful
 */
export function unissueLicence(licenceID: number, reqSession: Express.SessionData) {

  const db = sqlite(dbPath);

  const nowMillis = Date.now();

  const info = db.prepare("update LotteryLicences" +
    " set issueDate = null," +
    " issueTime = null," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where licenceID = ?" +
    " and recordDelete_timeMillis is null" +
    " and issueDate is not null")
    .run(
      reqSession.user.userName,
      nowMillis,
      licenceID
    );

  const changeCount = info.changes;

  if (changeCount) {

    addLicenceAmendmentWithDB(
      db,
      licenceID,
      "Unissue Licence",
      "",
      1,
      reqSession
    );

  }

  db.close();

  return changeCount > 0;

}

export function getLicenceTypeSummary(reqBody: any) {

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

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {

    const record = rows[rowIndex];

    record.applicationDateString = dateTimeFns.dateIntegerToString(record.applicationDate);
    record.issueDateString = dateTimeFns.dateIntegerToString(record.issueDate);

    record.locationDisplayName =
      record.locationName === "" ? record.locationAddress1 : record.locationName;

    record.licenceType = (configFns.getLicenceType(record.licenceTypeKey) || {}).licenceType || "";

  }

  return rows;

}

export function getActiveLicenceSummary(reqBody: any, reqSession: Express.SessionData) {

  const addCalculatedFieldsFn = function(ele: llm.LotteryLicence) {

    ele.recordType = "licence";

    ele.startDateString = dateTimeFns.dateIntegerToString(ele.startDate || 0);
    ele.endDateString = dateTimeFns.dateIntegerToString(ele.endDate || 0);

    ele.issueDateString = dateTimeFns.dateIntegerToString(ele.issueDate || 0);

    ele.locationDisplayName =
      (ele.locationName === "" ? ele.locationAddress1 : ele.locationName);

    ele.canUpdate = canUpdateObject(ele, reqSession);
  };


  const db = sqlite(dbPath, {
    readonly: true
  });


  const startEndDateStart = dateTimeFns.dateStringToInteger(reqBody.startEndDateStartString);
  const startEndDateEnd = dateTimeFns.dateStringToInteger(reqBody.startEndDateEndString);


  let sql = "select l.licenceID, l.externalLicenceNumber," +
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


  const rows: llm.LotteryLicence[] = db.prepare(sql).all(sqlParams);

  db.close();

  rows.forEach(addCalculatedFieldsFn);

  return rows;
}


/*
 * TRANSACTIONS
 */

/**
 * @returns The new transactionIndex
 */
export function addTransaction(reqBody: any, reqSession: Express.SessionData) {

  const db = sqlite(dbPath);

  const licenceObj = getLicenceWithDB(db, reqBody.licenceID, reqSession, {
    includeTicketTypes: false,
    includeFields: false,
    includeEvents: false,
    includeAmendments: false,
    includeTransactions: false
  });

  const row = db.prepare("select ifnull(max(transactionIndex), -1) as maxIndex" +
    " from LotteryLicenceTransactions" +
    " where licenceID = ?")
    .get(reqBody.licenceID);

  const newTransactionIndex: number = row.maxIndex + 1;

  const rightNow = new Date();

  const transactionDate = dateTimeFns.dateToInteger(rightNow);
  const transactionTime = dateTimeFns.dateToTimeInteger(rightNow);

  db.prepare("insert into LotteryLicenceTransactions (" +
    "licenceID, transactionIndex," +
    " transactionDate, transactionTime," +
    " externalReceiptNumber, transactionAmount, transactionNote," +
    " recordCreate_userName, recordCreate_timeMillis," +
    " recordUpdate_userName, recordUpdate_timeMillis)" +
    " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(
      reqBody.licenceID,
      newTransactionIndex,
      transactionDate,
      transactionTime,
      reqBody.externalReceiptNumber,
      reqBody.transactionAmount,
      reqBody.transactionNote,
      reqSession.user.userName,
      rightNow.getTime(),
      reqSession.user.userName,
      rightNow.getTime()
    );

  if (licenceObj.trackUpdatesAsAmendments) {

    addLicenceAmendmentWithDB(
      db,
      reqBody.licenceID,
      "New Transaction",
      "",
      1,
      reqSession
    );

  }

  if (reqBody.issueLicence === "true") {

    db.prepare("update LotteryLicences" +
      " set issueDate = ?," +
      " issueTime = ?," +
      " trackUpdatesAsAmendments = 1," +
      " recordUpdate_userName = ?," +
      " recordUpdate_timeMillis = ?" +
      " where licenceID = ?" +
      " and recordDelete_timeMillis is null" +
      " and issueDate is null")
      .run(
        transactionDate,
        transactionTime,
        reqSession.user.userName,
        rightNow.getTime(),
        reqBody.licenceID
      );

  }

  db.close();

  return newTransactionIndex;

}

/**
 * @returns TRUE if successful
 */
export function voidTransaction(licenceID: number, transactionIndex: number, reqSession: Express.SessionData) {

  const db = sqlite(dbPath);

  const licenceObj = getLicenceWithDB(db, licenceID, reqSession, {
    includeTicketTypes: false,
    includeFields: false,
    includeEvents: false,
    includeAmendments: false,
    includeTransactions: false
  });

  const nowMillis = Date.now();

  const info = db.prepare("update LotteryLicenceTransactions" +
    " set recordDelete_userName = ?," +
    " recordDelete_timeMillis = ?" +
    " where licenceID = ?" +
    " and transactionIndex = ?" +
    " and recordDelete_timeMillis is null")
    .run(
      reqSession.user.userName,
      nowMillis,
      licenceID,
      transactionIndex
    );

  const changeCount = info.changes;

  if (changeCount && licenceObj.trackUpdatesAsAmendments) {

    addLicenceAmendmentWithDB(
      db,
      licenceID,
      "Transaction Voided",
      "",
      1,
      reqSession
    );

  }

  db.close();

  return changeCount > 0;

}


/*
 * EVENTS
 */

let eventTableStats: llm.LotteryEventStats = {
  eventYearMin: 1970
};

let eventTableStatsExpiryMillis = -1;

export function getEventTableStats() {

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

}

export function getEvents(year: number, month: number, reqSession: Express.SessionData) {

  const addCalculatedFieldsFn = function(ele: llm.LotteryEvent) {

    ele.recordType = "event";

    ele.eventDateString = dateTimeFns.dateIntegerToString(ele.eventDate);

    ele.startTimeString = dateTimeFns.timeIntegerToString(ele.startTime || 0);
    ele.endTimeString = dateTimeFns.timeIntegerToString(ele.endTime || 0);

    ele.locationDisplayName = (ele.locationName === "" ? ele.locationAddress1 : ele.locationName);

    ele.canUpdate = canUpdateObject(ele, reqSession);

    delete ele.locationName;
    delete ele.locationAddress1;
    delete ele.bank_name;
    delete ele.costs_receipts;
  };

  const db = sqlite(dbPath, {
    readonly: true
  });

  const rows: llm.LotteryEvent[] =
    db.prepare("select e.eventDate, e.bank_name, e.costs_receipts," +
      " l.licenceID, l.externalLicenceNumber, l.licenceTypeKey, l.licenceDetails," +
      " lo.locationName, lo.locationAddress1," +
      " l.startTime, l.endTime," +
      " o.organizationName," +
      " e.recordCreate_userName, e.recordCreate_timeMillis, e.recordUpdate_userName, e.recordUpdate_timeMillis" +
      " from LotteryEvents e" +
      " left join LotteryLicences l on e.licenceID = l.licenceID" +
      " left join Locations lo on l.locationID = lo.locationID" +
      " left join Organizations o on l.organizationID = o.organizationID" +
      " where e.recordDelete_timeMillis is null" +
      " and l.recordDelete_timeMillis is null" +
      " and o.recordDelete_timeMillis is null" +
      " and e.eventDate > ((? * 10000) + (? * 100))" +
      " and e.eventDate < ((? * 10000) + (? * 100) + 99)" +
      " order by e.eventDate, l.startTime")
      .all(year, month, year, month);

  db.close();

  rows.forEach(addCalculatedFieldsFn);

  return rows;

}

export function getOutstandingEvents(reqBody: any, reqSession: Express.SessionData) {

  const addCalculatedFieldsFn = function(ele: llm.LotteryEvent) {

    ele.recordType = "event";

    ele.eventDateString = dateTimeFns.dateIntegerToString(ele.eventDate);
    ele.reportDateString = dateTimeFns.dateIntegerToString(ele.reportDate);

    ele.licenceType = (configFns.getLicenceType(ele.licenceTypeKey) || {}).licenceType || "";

    ele.bank_name_isOutstanding = (ele.bank_name === null || ele.bank_name === "");

    ele.canUpdate = canUpdateObject(ele, reqSession);
  };

  const db = sqlite(dbPath, {
    readonly: true
  });

  const sqlParams = [];

  let sql = "select" +
    " o.organizationID, o.organizationName," +
    " e.eventDate, e.reportDate," +
    " l.licenceTypeKey, l.licenceID, l.externalLicenceNumber," +
    " e.bank_name, e.bank_address, e.bank_accountNumber, e.bank_accountBalance," +
    " e.costs_receipts," +
    " e.recordUpdate_userName, e.recordUpdate_timeMillis" +

    " from LotteryEvents e" +
    " left join LotteryLicences l on e.licenceID = l.licenceID" +
    " left join Organizations o on l.organizationID = o.organizationID" +

    " where e.recordDelete_timeMillis is null" +
    " and l.recordDelete_timeMillis is null" +
    (" and (" +
      "e.reportDate is null or e.reportDate = 0" +
      //" or e.bank_name is null or e.bank_name = ''" +
      //" or e.costs_receipts is null or e.costs_receipts = 0" +
      ")");

  if (reqBody.licenceTypeKey && reqBody.licenceTypeKey !== "") {

    sql += " and l.licenceTypeKey = ?";
    sqlParams.push(reqBody.licenceTypeKey);

  }

  if (reqBody.eventDateType) {

    const currentDate = dateTimeFns.dateToInteger(new Date());

    if (reqBody.eventDateType === "past") {
      sql += " and e.eventDate < ?";
      sqlParams.push(currentDate);
    }
    else if (reqBody.eventDateType === "upcoming") {
      sql += " and e.eventDate >= ?";
      sqlParams.push(currentDate);
    }

  }

  sql += " order by o.organizationName, o.organizationID, e.eventDate, l.licenceID";

  const rows: llm.LotteryEvent[] =
    db.prepare(sql).all(sqlParams);

  db.close();

  rows.forEach(addCalculatedFieldsFn);

  return rows;

}

export function getEventFinancialSummary(reqBody: any) {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const sqlParams = [];

  let sql = "select licenceTypeKey," +
    " count(licenceID) as licenceCount," +
    " sum(ifnull(licenceFee, 0)) as licenceFeeSum," +
    " sum(costs_receiptsSum) as costs_receiptsSum," +
    " sum(costs_adminSum) as costs_adminSum," +
    " sum(costs_prizesAwardedSum) as costs_prizesAwardedSum," +
    " sum(costs_charitableDonationsSum) as costs_charitableDonationsSum," +
    " sum(costs_netProceedsSum) as costs_netProceedsSum," +
    " sum(costs_amountDonatedSum) as costs_amountDonatedSum" +
    " from (" +
    "select l.licenceID, l.licenceTypeKey, l.licenceFee," +
    " sum(ifnull(e.costs_receipts, 0)) as costs_receiptsSum," +
    " sum(ifnull(e.costs_admin,0)) as costs_adminSum," +
    " sum(ifnull(e.costs_prizesAwarded,0)) as costs_prizesAwardedSum," +
    " sum(ifnull(e.costs_charitableDonations,0)) as costs_charitableDonationsSum," +
    " sum(ifnull(e.costs_netProceeds,0)) as costs_netProceedsSum," +
    " sum(ifnull(e.costs_amountDonated,0)) as costs_amountDonatedSum" +
    " from LotteryLicences l" +
    " left join LotteryEvents e on l.licenceID = e.licenceID and e.recordDelete_timeMillis is null" +
    " where l.recordDelete_timeMillis is null";

  if (reqBody.eventDateStartString && reqBody.eventDateStartString !== "") {

    sql += " and (e.eventDate is null or e.eventDate >= ?)";

    sqlParams.push(dateTimeFns.dateStringToInteger(reqBody.eventDateStartString));

  }

  if (reqBody.eventDateEndString && reqBody.eventDateEndString !== "") {

    sql += " and (e.eventDate is null or e.eventDate <= ?)";

    sqlParams.push(dateTimeFns.dateStringToInteger(reqBody.eventDateEndString));

  }

  sql += " group by l.licenceID, l.licenceTypeKey, l.licenceFee" +
    " ) t" +
    " group by licenceTypeKey";

  const rows = db.prepare(sql).all(sqlParams);

  db.close();

  return rows;

}

export function getEvent(licenceID: number, eventDate: number, reqSession: Express.SessionData) {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const eventObj: llm.LotteryEvent = db.prepare("select *" +
    " from LotteryEvents" +
    " where recordDelete_timeMillis is null" +
    " and licenceID = ?" +
    " and eventDate = ?")
    .get(licenceID, eventDate);

  if (eventObj) {

    eventObj.recordType = "event";

    eventObj.eventDateString = dateTimeFns.dateIntegerToString(eventObj.eventDate);

    eventObj.reportDateString = dateTimeFns.dateIntegerToString(eventObj.reportDate);

    eventObj.startTimeString = dateTimeFns.timeIntegerToString(eventObj.startTime || 0);
    eventObj.endTimeString = dateTimeFns.timeIntegerToString(eventObj.endTime || 0);

    eventObj.canUpdate = canUpdateObject(eventObj, reqSession);

    const rows = db.prepare("select fieldKey, fieldValue" +
      " from LotteryEventFields" +
      " where licenceID = ? and eventDate = ?")
      .all(licenceID, eventDate);

    eventObj.eventFields = rows || [];

  }

  db.close();

  return eventObj;

}

export function getPastEventBankingInformation(licenceID: number) {

  const addCalculatedFieldsFn = function(ele) {
    ele.eventDateMaxString = dateTimeFns.dateIntegerToString(ele.eventDateMax);
  };

  const db = sqlite(dbPath, {
    readonly: true
  });

  const organizationID = db.prepare("select organizationID from LotteryLicences" +
    " where licenceID = ?")
    .get(licenceID)
    .organizationID;

  const cutoffDateInteger = dateTimeFns.dateToInteger(new Date()) - 50000;

  const bankInfoList = db.prepare("select bank_name, bank_address, bank_accountNumber," +
    " max(eventDate) as eventDateMax" +
    " from LotteryEvents" +
    " where licenceID in (select licenceID from LotteryLicences where organizationID = ? and recordDelete_timeMillis is null)" +
    " and licenceID <> ?" +
    " and eventDate >= ?" +
    " and recordDelete_timeMillis is null" +
    " and bank_name is not null and bank_name <> ''" +
    " and bank_address is not null and bank_address <> ''" +
    " and bank_accountNumber is not null and bank_accountNumber <> ''" +
    " group by bank_name, bank_address, bank_accountNumber" +
    " order by max(eventDate) desc")
    .all(organizationID, licenceID, cutoffDateInteger);

  db.close();

  bankInfoList.forEach(addCalculatedFieldsFn);

  return bankInfoList;

}

/**
 * @returns TRUE if successful
 */
export function updateEvent(reqBody: any, reqSession: Express.SessionData): boolean {

  const db = sqlite(dbPath);

  const nowMillis = Date.now();

  const info = db.prepare("update LotteryEvents" +
    " set reportDate = ?," +
    " bank_name = ?," +
    " bank_address = ?," +
    " bank_accountNumber = ?," +
    " bank_accountBalance = ?," +
    " costs_receipts = ?," +
    " costs_admin = ?," +
    " costs_prizesAwarded = ?," +
    " costs_charitableDonations = ?," +
    " costs_netProceeds = ?," +
    " costs_amountDonated = ?," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where licenceID = ?" +
    " and eventDate = ?" +
    " and recordDelete_timeMillis is null")
    .run(
      dateTimeFns.dateStringToInteger(reqBody.reportDateString),
      reqBody.bank_name,
      reqBody.bank_address,
      reqBody.bank_accountNumber,
      reqBody.bank_accountBalance,
      reqBody.costs_receipts,
      reqBody.costs_admin,
      reqBody.costs_prizesAwarded,
      reqBody.costs_charitableDonations,
      reqBody.costs_netProceeds,
      reqBody.costs_amountDonated,
      reqSession.user.userName,
      nowMillis,
      reqBody.licenceID,
      reqBody.eventDate
    );

  const changeCount = info.changes;

  if (!changeCount) {

    db.close();
    return false;

  }

  // Fields

  db.prepare("delete from LotteryEventFields" +
    " where licenceID = ?" +
    " and eventDate = ?")
    .run(reqBody.licenceID, reqBody.eventDate);

  const fieldKeys = reqBody.fieldKeys.substring(1).split(",");

  for (let fieldIndex = 0; fieldIndex < fieldKeys.length; fieldIndex += 1) {

    const fieldKey = fieldKeys[fieldIndex];
    const fieldValue = reqBody[fieldKey];

    if (fieldValue !== "") {

      db.prepare("insert into LotteryEventFields" +
        " (licenceID, eventDate, fieldKey, fieldValue)" +
        " values (?, ?, ?, ?)")
        .run(reqBody.licenceID, reqBody.eventDate, fieldKey, fieldValue);

    }

  }

  db.close();

  // Purge cached stats
  eventTableStatsExpiryMillis = -1;

  return changeCount > 0;

}

/**
 * @returns TRUE if successful
 */
export function deleteEvent(licenceID: number, eventDate: number, reqSession: Express.SessionData) {

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

}

/**
 * @returns TRUE if successful
 */
export function pokeEvent(licenceID: number, eventDate: number, reqSession: Express.SessionData) {

  const db = sqlite(dbPath);

  const nowMillis = Date.now();

  const info = db.prepare("update LotteryEvents" +
    " set recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where licenceID = ?" +
    " and eventDate = ?" +
    " and recordDelete_timeMillis is null")
    .run(
      reqSession.user.userName,
      nowMillis,
      licenceID,
      eventDate
    );

  db.close();

  return info.changes > 0;

}


/*
 * APPLICATION SETTINGS
 */

export function getApplicationSettings() {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const rows = db.prepare("select * from ApplicationSettings order by orderNumber, settingKey").all();

  db.close();

  return rows;

}

export function getApplicationSetting(settingKey: string) {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const settingValue = getApplicationSettingWithDB(db, settingKey);

  db.close();

  return settingValue;

}

/**
 * @returns TRUE if successful
 */
export function updateApplicationSetting(settingKey: string, settingValue: string, reqSession: Express.SessionData) {

  const db = sqlite(dbPath);

  const nowMillis = Date.now();

  const info = db.prepare("update ApplicationSettings" +
    " set settingValue = ?," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where settingKey = ?")
    .run(
      settingValue,
      reqSession.user.userName,
      nowMillis,
      settingKey
    );

  db.close();

  return info.changes > 0;

}
