"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreLocation = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_2 = require("../../data/databasePaths");
exports.restoreLocation = (locationID, reqSession) => {
    const db = sqlite(databasePaths_2.licencesDB);
    const nowMillis = Date.now();
    const info = db.prepare("update Locations" +
        " set recordDelete_userName = null," +
        " recordDelete_timeMillis = null," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where recordDelete_timeMillis is not null" +
        " and locationID = ?")
        .run(reqSession.user.userName, nowMillis, locationID);
    db.close();
    return info.changes > 0;
};
