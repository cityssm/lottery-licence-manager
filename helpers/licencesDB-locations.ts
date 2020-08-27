import * as sqlite from "better-sqlite3";

import { licencesDB as dbPath } from "../data/databasePaths";

import * as llm from "../types/recordTypes";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";


/**
 * @returns New locationID
 */
export const createLocation = (reqBody: llm.Location, reqSession: Express.SessionData) => {

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

};


/**
 * @returns TRUE if successful
 */
export const updateLocation = (reqBody: llm.Location, reqSession: Express.SessionData): boolean => {

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

};


/**
 * @returns TRUE if successful
 */
export const deleteLocation = (locationID: number, reqSession: Express.SessionData): boolean => {

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

};


/**
 * @returns TRUE if successful
 */
export const restoreLocation = (locationID: number, reqSession: Express.SessionData): boolean => {

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

};


/**
 * @returns TRUE if successful
 */
export const mergeLocations =
  (targetLocationID: number, sourceLocationID: number, reqSession: Express.SessionData) => {

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
  };


export const getInactiveLocations = (inactiveYears: number) => {

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

    (" and max(ifnull(l.licences_endDateMax, 0)," +
      " ifnull(d.distributor_endDateMax, 0)," +
      " ifnull(m.manufacturer_endDateMax, 0)) <= ?") +

    " order by lo.locationName, lo.locationAddress1, lo.locationID")
    .all(cutoffDateInteger);

  db.close();

  for (const locationObj of rows) {

    locationObj.locationDisplayName =
      locationObj.locationName === "" ? locationObj.locationAddress1 : locationObj.locationName;

    locationObj.recordUpdate_dateString = dateTimeFns.dateToString(new Date(locationObj.recordUpdate_timeMillis));

    locationObj.licences_endDateMaxString = dateTimeFns.dateIntegerToString(locationObj.licences_endDateMax || 0);
    locationObj.distributor_endDateMaxString = dateTimeFns.dateIntegerToString(locationObj.distributor_endDateMax || 0);

    locationObj.manufacturer_endDateMaxString =
      dateTimeFns.dateIntegerToString(locationObj.manufacturer_endDateMax || 0);
  }

  return rows;
};
