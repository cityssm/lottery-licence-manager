"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeLocations = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
const mergeLocations = (targetLocationID, sourceLocationID, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB);
    const nowMillis = Date.now();
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
    db.prepare("update Locations" +
        " set locationIsDistributor = ?," +
        " locationIsManufacturer = ?" +
        " where locationID = ?")
        .run(locationAttributes.locationIsDistributorMax, locationAttributes.locationIsManufacturerMax, targetLocationID);
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
    db.prepare("update Locations" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where locationID = ?")
        .run(reqSession.user.userName, nowMillis, sourceLocationID);
    db.close();
    return true;
};
exports.mergeLocations = mergeLocations;
