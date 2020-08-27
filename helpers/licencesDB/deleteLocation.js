"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLocation = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
exports.deleteLocation = (locationID, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB);
    const nowMillis = Date.now();
    const info = db.prepare("update Locations" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where recordDelete_timeMillis is null" +
        " and locationID = ?")
        .run(reqSession.user.userName, nowMillis, locationID);
    db.close();
    return info.changes > 0;
};
