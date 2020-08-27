import * as sqlite from "better-sqlite3";

import { licencesDB as dbPath } from "../../data/databasePaths";


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
