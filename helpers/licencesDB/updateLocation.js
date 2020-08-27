"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLocation = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
exports.updateLocation = (reqBody, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB);
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
        .run(reqBody.locationName, reqBody.locationAddress1, reqBody.locationAddress2, reqBody.locationCity, reqBody.locationProvince, reqBody.locationPostalCode, reqBody.locationIsDistributor ? 1 : 0, reqBody.locationIsManufacturer ? 1 : 0, reqSession.user.userName, nowMillis, reqBody.locationID);
    db.close();
    return info.changes > 0;
};
