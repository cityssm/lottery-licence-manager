"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pokeLicence = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_2 = require("../../data/databasePaths");
exports.pokeLicence = (licenceID, reqSession) => {
    const db = sqlite(databasePaths_2.licencesDB);
    const nowMillis = Date.now();
    const info = db.prepare("update LotteryLicences" +
        " set recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where licenceID = ?" +
        " and recordDelete_timeMillis is null")
        .run(reqSession.user.userName, nowMillis, licenceID);
    db.close();
    return info.changes > 0;
};
