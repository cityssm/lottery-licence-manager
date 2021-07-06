import sqlite from "better-sqlite3";

import { licencesDB as databasePath } from "../../data/databasePaths.js";

import type * as expressSession from "express-session";


export const mergeLocations =
  (targetLocationID: number, sourceLocationID: number, requestSession: expressSession.Session): boolean => {

    const database = sqlite(databasePath);

    const nowMillis = Date.now();

    // Get locationAttributes

    const locationAttributes = database.prepare("select max(locationIsDistributor) as locationIsDistributorMax," +
      " max(locationIsManufacturer) as locationIsManufacturerMax," +
      " count(locationID) as locationCount" +
      " from Locations" +
      " where recordDelete_timeMillis is null" +
      " and (locationID = ? or locationID = ?)")
      .get(targetLocationID, sourceLocationID);

    if (!locationAttributes) {

      database.close();
      return false;

    }

    if (locationAttributes.locationCount !== 2) {

      database.close();
      return false;

    }

    // Update the target location

    database.prepare("update Locations" +
      " set locationIsDistributor = ?," +
      " locationIsManufacturer = ?" +
      " where locationID = ?")
      .run(
        locationAttributes.locationIsDistributorMax,
        locationAttributes.locationIsManufacturerMax,
        targetLocationID
      );

    // Update records assigned to the source location

    database.prepare("update LotteryLicences" +
      " set locationID = ?" +
      " where locationID = ?" +
      " and recordDelete_timeMillis is null")
      .run(targetLocationID, sourceLocationID);

    database.prepare("update LotteryLicenceTicketTypes" +
      " set distributorLocationID = ?" +
      " where distributorLocationID = ?" +
      " and recordDelete_timeMillis is null")
      .run(targetLocationID, sourceLocationID);

    database.prepare("update LotteryLicenceTicketTypes" +
      " set manufacturerLocationID = ?" +
      " where manufacturerLocationID = ?" +
      " and recordDelete_timeMillis is null")
      .run(targetLocationID, sourceLocationID);

    // Set the source record to inactive

    database.prepare("update Locations" +
      " set recordDelete_userName = ?," +
      " recordDelete_timeMillis = ?" +
      " where locationID = ?")
      .run(
        requestSession.user.userName,
        nowMillis,
        sourceLocationID
      );

    database.close();

    return true;
  };
