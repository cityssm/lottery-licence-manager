"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLocation = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
const createLocation = (reqBody, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB);
    const nowMillis = Date.now();
    const info = db.prepare("insert into Locations" +
        " (locationName, locationAddress1, locationAddress2, locationCity, locationProvince, locationPostalCode," +
        " locationIsDistributor, locationIsManufacturer," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(reqBody.locationName, reqBody.locationAddress1, reqBody.locationAddress2, reqBody.locationCity, reqBody.locationProvince, reqBody.locationPostalCode, reqBody.locationIsDistributor || 0, reqBody.locationIsManufacturer || 0, reqSession.user.userName, nowMillis, reqSession.user.userName, nowMillis);
    db.close();
    return info.lastInsertRowid;
};
exports.createLocation = createLocation;
