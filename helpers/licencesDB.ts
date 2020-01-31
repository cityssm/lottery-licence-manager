"use strict";

import sqlite = require("better-sqlite3");
const dbPath = "data/licences.db";

import * as llm from "./llmTypes";
import { configFns } from "./configFns";
import { dateTimeFns } from "./dateTimeFns";


let licenceTableStats = {};
let licenceTableStatsExpiryMillis = -1;

let eventTableStats = {};
let eventTableStatsExpiryMillis = -1;


/*
 * TYPES
 */


/*
 * REUSED FUNCTIONS
 */


function getApplicationSetting(db: sqlite.Database, settingKey: string): string {

  const row = db.prepare("select settingValue" +
    " from ApplicationSettings" +
    " where SettingKey = ?")
    .get(settingKey);

  if (row) {

    return row.settingValue || "";

  }

  return "";

}


function canUpdateObject(obj: llm.Record, reqSession: Express.SessionData) {

  // Check user permissions

  let canUpdate = false;

  if (!reqSession) {

    canUpdate = false;

  } else if (obj.recordDelete_timeMillis) {

    // Deleted records cannot be updated
    canUpdate = false;

  } else if (reqSession.user.userProperties.canUpdate === "true") {

    canUpdate = true;

  } else if (reqSession.user.userProperties.canCreate === "true" &&
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


function getLicence(licenceID: number, reqSession: Express.SessionData, db: sqlite.Database) {

  const licenceObj: llm.LotteryLicence =
    db.prepare("select l.*," +
      " lo.locationName, lo.locationAddress1" +
      " from LotteryLicences l" +
      " left join Locations lo on l.locationID = lo.locationID" +
      " where l.recordDelete_timeMillis is null" +
      " and l.licenceID = ?")
      .get(licenceID);

  if (licenceObj) {

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

    // Ticket types
    {

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

    // Licence fields
    {

      const fieldList = db.prepare("select * from LotteryLicenceFields" +
        " where licenceID = ?")
        .all(licenceID);

      licenceObj.licenceFields = fieldList;

    }

    // Events
    {

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

    // Licence amendments
    {

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

    // Transactions
    {

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

  }

  return licenceObj;

}


function addLicenceAmendment(licenceID: number, amendmentType: string, amendment: string, isHidden: number, reqSession: Express.SessionData, db: sqlite.Database) {

  const amendmentIndexRecord = db.prepare("select amendmentIndex" +
    " from LotteryLicenceAmendments" +
    " where licenceID = ?" +
    " order by amendmentIndex desc" +
    " limit 1")
    .get(licenceID);

  const amendmentIndex = (amendmentIndexRecord ? amendmentIndexRecord.amendmentIndex : 0) + 1;

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

}


function getRawRowsColumns(sql: string, params: any[]): llm.RawRowsColumnsReturn {

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
 * RETURNED FUNCTIONS
 */


export const licencesDB = {

  getRawRowsColumns: getRawRowsColumns,


  /*
   * LOCATIONS
   */

  getLocations: function(reqBodyOrParamsObj: any, reqSession: Express.SessionData) {

    const db = sqlite(dbPath, {
      readonly: true
    });

    const sqlParams = [];

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

      " where lo.recordDelete_timeMillis is null";

    if (reqBodyOrParamsObj.locationIsDistributor && reqBodyOrParamsObj.locationIsDistributor !== "") {

      sql += " and lo.locationIsDistributor = ?";
      sqlParams.push(reqBodyOrParamsObj.locationIsDistributor);

    }

    if (reqBodyOrParamsObj.locationIsManufacturer && reqBodyOrParamsObj.locationIsManufacturer !== "") {

      sql += " and lo.locationIsManufacturer = ?";
      sqlParams.push(reqBodyOrParamsObj.locationIsManufacturer);

    }

    sql += " group by lo.locationID, lo.locationName," +
      " lo.locationAddress1, lo.locationAddress2, lo.locationCity, lo.locationProvince," +
      " lo.locationIsDistributor, lo.locationIsManufacturer" +
      " order by case when lo.locationName = '' then lo.locationAddress1 else lo.locationName end";

    const rows: llm.Location[] =
      db.prepare(sql).all(sqlParams);

    db.close();

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {

      const locationObj = rows[rowIndex];

      locationObj.recordType = "location";

      locationObj.locationDisplayName =
        locationObj.locationName === "" ? locationObj.locationAddress1 : locationObj.locationName;

      locationObj.licences_endDateMaxString = dateTimeFns.dateIntegerToString(locationObj.licences_endDateMax);
      locationObj.distributor_endDateMaxString = dateTimeFns.dateIntegerToString(locationObj.distributor_endDateMax);
      locationObj.manufacturer_endDateMaxString = dateTimeFns.dateIntegerToString(locationObj.manufacturer_endDateMax);

      locationObj.canUpdate = canUpdateObject(locationObj, reqSession);

    }

    return rows;

  },

  getLocation: function(locationID: number, reqSession: Express.SessionData) {

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

  },

  createLocation: function(reqBody: any, reqSession: Express.SessionData) {

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

    return info.lastInsertRowid;

  },

  updateLocation: function(reqBody: any, reqSession: Express.SessionData) {

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

    return info.changes;

  },

  deleteLocation: function(locationID: number, reqSession: Express.SessionData) {

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

    return info.changes;

  },

  restoreLocation: function(locationID: number, reqSession: Express.SessionData) {

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

    return info.changes;

  },

  mergeLocations: function(targetLocationID: number, sourceLocationID: number, reqSession: Express.SessionData) {

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

  },


  /*
   * ORGANIZATIONS
   */

  getOrganizations: function(reqBody: any, useLimit: boolean, reqSession: Express.SessionData) {

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

    if (useLimit) {

      sql += " limit 100";

    }

    const rows = db.prepare(sql).all(sqlParams);

    db.close();

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {

      const organization = rows[rowIndex];

      organization.recordType = "organization";

      organization.licences_endDateMaxString = dateTimeFns.dateIntegerToString(organization.licences_endDateMax || 0);

      organization.canUpdate = canUpdateObject(rows[rowIndex], reqSession);

      delete organization.recordCreate_userName;
      delete organization.recordCreate_timeMillis;
      delete organization.recordUpdate_userName;
      delete organization.recordUpdate_timeMillis;

    }

    return rows;

  },

  getOrganization: function(organizationID: number, reqSession: Express.SessionData): llm.Organization {

    const db = sqlite(dbPath, {
      readonly: true
    });

    const organizationObj: llm.Organization =
      db.prepare("select * from Organizations" +
        " where organizationID = ?")
        .get(organizationID);

    if (organizationObj) {

      organizationObj.recordType = "organization";

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

  },

  createOrganization: function(reqBody: any, reqSession: Express.SessionData) {

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

    return info.lastInsertRowid;

  },

  updateOrganization: function(reqBody: any, reqSession: Express.SessionData) {

    const db = sqlite(dbPath);

    const nowMillis = Date.now();

    const info = db.prepare("update Organizations" +
      " set organizationName = ?," +
      " organizationAddress1 = ?," +
      " organizationAddress2 = ?," +
      " organizationCity = ?," +
      " organizationProvince = ?," +
      " organizationPostalCode = ?," +
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
        reqBody.isEligibleForLicences,
        reqBody.organizationNote,
        reqSession.user.userName,
        nowMillis,
        reqBody.organizationID
      );

    db.close();

    return info.changes;

  },

  deleteOrganization: function(organizationID: number, reqSession: Express.SessionData) {

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

    return info.changes;

  },

  restoreOrganization: function(organizationID: number, reqSession: Express.SessionData) {

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

    return info.changes;

  },

  getInactiveOrganizations: function(inactiveYears: number) {

    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - inactiveYears);

    const cutoffDateInteger = dateTimeFns.dateToInteger(cutoffDate);

    const db = sqlite(dbPath, {
      readonly: true
    });

    const rows = db.prepare("select o.organizationID, o.organizationName, l.licences_endDateMax" +
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

      organization.licences_endDateMaxString = dateTimeFns.dateIntegerToString(organization.licences_endDateMax || 0);

    }

    return rows;

  },

  /*
   * ORGANIZATION REPRESENTATIVES
   */

  addOrganizationRepresentative: function(organizationID: number, reqBody: any) {

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

    return {
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
      isDefault: newIsDefault
    };

  },

  updateOrganizationRepresentative: function(organizationID: number, reqBody: any) {

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

    return {
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
      isDefault: parseInt(reqBody.isDefault)
    };

  },

  deleteOrganizationRepresentative: function(organizationID: number, representativeIndex: number) {

    const db = sqlite(dbPath);

    db.prepare("delete from OrganizationRepresentatives" +
      " where organizationID = ?" +
      " and representativeIndex = ?")
      .run(organizationID, representativeIndex);

    db.close();

    return true;

  },

  setDefaultOrganizationRepresentative: function(organizationID: number, representativeIndex: number) {

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

  },


  /*
   * ORGANIZATION REMARKS
   */

  getOrganizationRemarks: function(organizationID: number, reqSession: Express.SessionData) {

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

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {

      const remark = rows[rowIndex];

      remark.recordType = "remark";

      remark.remarkDateString = dateTimeFns.dateIntegerToString(remark.remarkDate || 0);

      remark.remarkTimeString = dateTimeFns.timeIntegerToString(remark.remarkTime || 0);

      remark.canUpdate = canUpdateObject(remark, reqSession);

    }

    return rows;

  },

  getOrganizationRemark: function(organizationID: number, remarkIndex: number, reqSession: Express.SessionData) {

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

  },

  addOrganizationRemark: function(reqBody: any, reqSession: Express.SessionData) {

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

    return newRemarkIndex;

  },

  updateOrganizationRemark: function(reqBody: any, reqSession: Express.SessionData) {

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

    const changeCount = info.changes;

    db.close();

    return changeCount;

  },

  deleteOrganizationRemark: function(organizationID: number, remarkIndex: number, reqSession: Express.SessionData) {

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

    const changeCount = info.changes;

    db.close();

    return changeCount;

  },


  /*
   * LICENCES
   */

  getLicenceTableStats: function() {

    if (Date.now() < licenceTableStatsExpiryMillis) {

      return licenceTableStats;

    }

    licenceTableStatsExpiryMillis = Date.now() + (3600 * 1000);

    const db = sqlite(dbPath, {
      readonly: true
    });

    licenceTableStats = db.prepare("select" +
      " min(applicationDate / 10000) as applicationYearMin" +
      " from LotteryLicences" +
      " where recordDelete_timeMillis is null")
      .get();

    db.close();

    return licenceTableStats;

  },

  getLicences: function(reqBodyOrParamsObj: any, includeOrganization: boolean, useLimit: boolean, reqSession: Express.SessionData) {

    if (reqBodyOrParamsObj.organizationName && reqBodyOrParamsObj.organizationName !== "") {

      includeOrganization = true;

    }

    const db = sqlite(dbPath, {
      readonly: true
    });

    const sqlParams = [];

    let sql = "select l.licenceID, l.organizationID," +
      (includeOrganization ?
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
      (includeOrganization ?
        " left join Organizations o on l.organizationID = o.organizationID" :
        ""
      ) +
      " where l.recordDelete_timeMillis is null";

    if (reqBodyOrParamsObj.organizationID && reqBodyOrParamsObj.organizationID !== "") {

      sql += " and l.organizationID = ?";
      sqlParams.push(reqBodyOrParamsObj.organizationID);

    }

    if (reqBodyOrParamsObj.organizationName && reqBodyOrParamsObj.organizationName !== "") {

      const organizationNamePieces = reqBodyOrParamsObj.organizationName.toLowerCase().split(" ");

      for (let pieceIndex = 0; pieceIndex < organizationNamePieces.length; pieceIndex += 1) {

        sql += " and instr(lower(o.organizationName), ?)";
        sqlParams.push(organizationNamePieces[pieceIndex]);

      }

    }

    if (reqBodyOrParamsObj.licenceTypeKey && reqBodyOrParamsObj.licenceTypeKey !== "") {

      sql += " and l.licenceTypeKey = ?";
      sqlParams.push(reqBodyOrParamsObj.licenceTypeKey);

    }

    if (reqBodyOrParamsObj.licenceStatus) {

      if (reqBodyOrParamsObj.licenceStatus === "past") {

        sql += " and l.endDate < ?";
        sqlParams.push(dateTimeFns.dateToInteger(new Date()));

      } else if (reqBodyOrParamsObj.licenceStatus === "active") {

        sql += " and l.endDate >= ?";
        sqlParams.push(dateTimeFns.dateToInteger(new Date()));

      }

    }

    if (reqBodyOrParamsObj.locationID) {

      sql += " and (l.locationID = ?" +
        " or licenceID in (" +
        "select licenceID from LotteryLicenceTicketTypes" +
        " where recordDelete_timeMillis is null and (distributorLocationID = ? or manufacturerLocationID = ?)" +
        ")" +
        ")";

      sqlParams.push(reqBodyOrParamsObj.locationID);
      sqlParams.push(reqBodyOrParamsObj.locationID);
      sqlParams.push(reqBodyOrParamsObj.locationID);

    }

    sql += " order by l.endDate desc, l.startDate desc, l.licenceID";

    if (useLimit) {

      sql += " limit 100";

    }

    const rows: llm.LotteryLicence[] =
      db.prepare(sql).all(sqlParams);

    for (let index = 0; index < rows.length; index += 1) {

      const licenceObj = rows[index];

      licenceObj.recordType = "licence";

      licenceObj.applicationDateString = dateTimeFns.dateIntegerToString(licenceObj.applicationDate || 0);

      licenceObj.startDateString = dateTimeFns.dateIntegerToString(licenceObj.startDate || 0);
      licenceObj.endDateString = dateTimeFns.dateIntegerToString(licenceObj.endDate || 0);

      licenceObj.startTimeString = dateTimeFns.timeIntegerToString(licenceObj.startTime || 0);
      licenceObj.endTimeString = dateTimeFns.timeIntegerToString(licenceObj.endTime || 0);

      licenceObj.issueDateString = dateTimeFns.dateIntegerToString(licenceObj.issueDate || 0);

      licenceObj.locationDisplayName =
        (licenceObj.locationName === "" ? licenceObj.locationAddress1 : licenceObj.locationName);

      licenceObj.canUpdate = canUpdateObject(licenceObj, reqSession);

    }

    db.close();

    return rows;

  },

  getLicence: function(licenceID: number, reqSession: Express.SessionData): llm.LotteryLicence {

    const db = sqlite(dbPath, {
      readonly: true
    });

    const licenceObj = getLicence(licenceID, reqSession, db);

    db.close();

    return licenceObj;

  },

  getNextExternalLicenceNumberFromRange: function() {

    const db = sqlite(dbPath, {
      readonly: true
    });

    const rangeStart = parseInt(getApplicationSetting(db, "licences.externalLicenceNumber.range.start") || "-1");

    const rangeEnd = parseInt(getApplicationSetting(db, "licences.externalLicenceNumber.range.end") || "0");

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

    return newExternalLicenceNumber;

  },

  createLicence: function(reqBody: any, reqSession: Express.SessionData) {

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

    const licenceObj = getLicence(licenceID, reqSession, db);

    const feeCalculation = configFns.getProperty("licences.feeCalculationFn")(licenceObj);

    db.prepare("update LotteryLicences" +
      " set licenceFee = ?" +
      " where licenceID = ?")
      .run(feeCalculation.fee, licenceID);

    db.close();

    // Reset the cached stats
    licenceTableStatsExpiryMillis = -1;

    return licenceID;

  },

  updateLicence: function(reqBody: any, reqSession: Express.SessionData) {

    // Check if can update

    const db = sqlite(dbPath);

    const pastLicenceObj = getLicence(reqBody.licenceID, reqSession, db);

    if (!pastLicenceObj.canUpdate) {

      db.close();
      return 0;

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
      return changeCount;

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

        addLicenceAmendment(
          reqBody.licenceID,
          "Date Update",
          amendment,
          0,
          reqSession,
          db
        );

      }

      if (pastLicenceObj.organizationID !== parseInt(reqBody.organizationID) &&
        configFns.getProperty("amendments.trackOrganizationUpdate")) {

        addLicenceAmendment(
          reqBody.licenceID,
          "Organization Change",
          "",
          0,
          reqSession,
          db
        );

      }

      if (pastLicenceObj.locationID !== parseInt(reqBody.locationID) &&
        configFns.getProperty("amendments.trackLocationUpdate")) {

        addLicenceAmendment(
          reqBody.licenceID,
          "Location Change",
          "",
          0,
          reqSession,
          db
        );

      }

      if (pastLicenceObj.licenceFee !== parseFloat(reqBody.licenceFee) &&
        configFns.getProperty("amendments.trackLicenceFeeUpdate")) {

        addLicenceAmendment(
          reqBody.licenceID,
          "Licence Fee Change",
          "$" + pastLicenceObj.licenceFee.toFixed(2) + " -> $" + parseFloat(reqBody.licenceFee).toFixed(2),
          0,
          reqSession,
          db
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

        addLicenceAmendment(
          reqBody.licenceID,
          "Ticket Type Removed",
          "Removed " + reqBody.ticketType_toDelete + ".",
          0,
          reqSession,
          db
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

          addLicenceAmendment(
            reqBody.licenceID,
            "Ticket Type Removed",
            "Removed " + reqBody.ticketType_toDelete[deleteIndex] + ".",
            0,
            reqSession,
            db
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

        addLicenceAmendment(
          reqBody.licenceID,
          "New Ticket Type",
          "Added " + reqBody.ticketType_toAdd + ".",
          0,
          reqSession,
          db
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

          addLicenceAmendment(
            reqBody.licenceID,
            "New Ticket Type",
            "Added " + reqBody.ticketType_toAdd[addIndex] + ".",
            0,
            reqSession,
            db
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

          addLicenceAmendment(
            reqBody.licenceID,
            "Ticket Type Change",
            (reqBody.ticketType_ticketType + " Units: " +
              ticketTypeObj_past.unitCount + " -> " + reqBody.ticketType_unitCount),
            0,
            reqSession,
            db
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

            addLicenceAmendment(
              reqBody.licenceID,
              "Ticket Type Change",
              (reqBody.ticketType_ticketType[ticketTypeIndex] + " Units: " +
                ticketTypeObj_past.unitCount + " -> " + reqBody.ticketType_unitCount[ticketTypeIndex]),
              0,
              reqSession,
              db
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

    return changeCount;

  },

  deleteLicence: function(licenceID: number, reqSession: Express.SessionData) {

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

    return changeCount;

  },

  getDistinctTermsConditions: function(organizationID: number) {

    const db = sqlite(dbPath, {
      readonly: true
    });

    const rows = db.prepare("select termsConditions," +
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

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {

      const termsConditionsObj = rows[rowIndex];
      termsConditionsObj.startDateMaxString = dateTimeFns.dateIntegerToString(termsConditionsObj.startDateMax);

    }

    return rows;

  },

  pokeLicence: function(licenceID: number, reqSession: Express.SessionData) {

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

    const changeCount = info.changes;

    db.close();

    return changeCount;

  },

  issueLicence: function(reqBody: any, reqSession: Express.SessionData) {

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
        reqBody.licenceID
      );

    const changeCount = info.changes;

    db.close();

    return changeCount;

  },

  unissueLicence: function(licenceID: number, reqSession: Express.SessionData) {

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

      addLicenceAmendment(
        licenceID,
        "Unissue Licence",
        "",
        1,
        reqSession,
        db
      );

    }

    db.close();

    return changeCount;

  },

  getLicenceTypeSummary: function(reqBody: any) {

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

  },


  /*
   * TRANSACTIONS
   */

  addTransaction: function(reqBody: any, reqSession: Express.SessionData) {

    const db = sqlite(dbPath);

    const licenceObj = getLicence(reqBody.licenceID, reqSession, db);

    const row = db.prepare("select ifnull(max(transactionIndex), -1) as maxIndex" +
      " from LotteryLicenceTransactions" +
      " where licenceID = ?")
      .get(reqBody.licenceID);

    const newTransactionIndex = row.maxIndex + 1;

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

      addLicenceAmendment(
        reqBody.licenceID,
        "New Transaction",
        "",
        1,
        reqSession,
        db
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

  },

  voidTransaction: function(licenceID: number, transactionIndex: number, reqSession: Express.SessionData) {

    const db = sqlite(dbPath);

    const licenceObj = getLicence(licenceID, reqSession, db);

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

      addLicenceAmendment(
        licenceID,
        "Transaction Voided",
        "",
        1,
        reqSession,
        db
      );

    }

    db.close();

    return changeCount;

  },


  /*
   * EVENTS
   */

  getEventTableStats: function() {

    if (Date.now() < eventTableStatsExpiryMillis) {

      return eventTableStats;

    }

    eventTableStatsExpiryMillis = Date.now() + (3600 * 1000);

    const db = sqlite(dbPath, {
      readonly: true
    });

    eventTableStats = db.prepare("select" +
      " min(eventDate / 10000) as eventYearMin" +
      " from LotteryEvents" +
      " where recordDelete_timeMillis is null" +
      " and eventDate > 19700000")
      .get();

    db.close();

    return eventTableStats;

  },

  getEvents: function(year: number, month: number, reqSession: Express.SessionData) {

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

    for (let eventIndex = 0; eventIndex < rows.length; eventIndex += 1) {

      const eventObj = rows[eventIndex];

      eventObj.recordType = "event";

      eventObj.eventDateString = dateTimeFns.dateIntegerToString(eventObj.eventDate);

      eventObj.startTimeString = dateTimeFns.timeIntegerToString(eventObj.startTime || 0);
      eventObj.endTimeString = dateTimeFns.timeIntegerToString(eventObj.endTime || 0);

      eventObj.locationDisplayName = (eventObj.locationName === "" ? eventObj.locationAddress1 : eventObj.locationName);

      eventObj.canUpdate = canUpdateObject(eventObj, reqSession);

      delete eventObj.locationName;
      delete eventObj.locationAddress1;
      delete eventObj.bank_name;
      delete eventObj.costs_receipts;

    }

    return rows;

  },

  getOutstandingEvents: function(reqBody: any, reqSession: Express.SessionData) {

    const db = sqlite(dbPath, {
      readonly: true
    });

    const sqlParams = [];

    let sql = "select" +
      " o.organizationID, o.organizationName," +
      " e.eventDate, e.reportDate," +
      " l.licenceTypeKey, l.licenceID, l.externalLicenceNumber," +
      " e.bank_name, e.bank_address, e.bank_accountNumber, e.bank_accountBalance," +
      " e.costs_receipts, e.costs_netProceeds," +
      " e.recordUpdate_userName, e.recordUpdate_timeMillis" +

      " from LotteryEvents e" +
      " left join LotteryLicences l on e.licenceID = l.licenceID" +
      " left join Organizations o on l.organizationID = o.organizationID" +

      " where e.recordDelete_timeMillis is null" +
      " and l.recordDelete_timeMillis is null" +
      (" and (" +
        "e.reportDate is null or e.reportDate = 0" +
        " or e.bank_name is null or e.bank_name = ''" +
        " or e.costs_receipts is null or e.costs_receipts = 0" +
        " or e.costs_netProceeds is null or e.costs_netProceeds = 0" +
        ")");

    if (reqBody.licenceTypeKey && reqBody.licenceTypeKey !== "") {

      sql += " and l.licenceTypeKey = ?";
      sqlParams.push(reqBody.licenceTypeKey);

    }

    sql += " order by o.organizationName, o.organizationID, e.eventDate, l.licenceID";

    const rows: llm.LotteryEvent[] =
      db.prepare(sql).all(sqlParams);

    db.close();

    for (let eventIndex = 0; eventIndex < rows.length; eventIndex += 1) {

      const eventObj = rows[eventIndex];

      eventObj.recordType = "event";

      eventObj.eventDateString = dateTimeFns.dateIntegerToString(eventObj.eventDate);
      eventObj.reportDateString = dateTimeFns.dateIntegerToString(eventObj.reportDate);

      eventObj.licenceType = (configFns.getLicenceType(eventObj.licenceTypeKey) || {}).licenceType || "";

      eventObj.bank_name_isOutstanding = (eventObj.bank_name === null || eventObj.bank_name === "");

      eventObj.canUpdate = canUpdateObject(eventObj, reqSession);

    }

    return rows;

  },

  getEventFinancialSummary: function(reqBody: any) {

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

  },

  getEvent: function(licenceID: number, eventDate: number, reqSession: Express.SessionData) {

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

  },

  updateEvent: function(reqBody: any, reqSession: Express.SessionData) {

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
      return changeCount;

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

    return changeCount;

  },

  deleteEvent: function(licenceID: number, eventDate: number, reqSession: Express.SessionData) {

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

    return changeCount;

  },

  pokeEvent: function(licenceID: number, eventDate: number, reqSession: Express.SessionData) {

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

    const changeCount = info.changes;

    db.close();

    return changeCount;

  },

  /*
   * APPLICATION SETTINGS
   */

  getApplicationSettings: function() {

    const db = sqlite(dbPath, {
      readonly: true
    });

    const rows = db.prepare("select * from ApplicationSettings order by orderNumber, settingKey").all();

    db.close();

    return rows;

  },

  getApplicationSetting: function(settingKey: string) {

    const db = sqlite(dbPath, {
      readonly: true
    });

    const settingValue = getApplicationSetting(db, settingKey);

    db.close();

    return settingValue;

  },

  updateApplicationSetting: function(settingKey: string, settingValue: string, reqSession: Express.SessionData) {

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

    const changeCount = info.changes;

    db.close();

    return changeCount;

  }
};
