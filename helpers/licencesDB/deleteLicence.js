"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLicence = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_2 = require("../../data/databasePaths");
const licencesDB_1 = require("../licencesDB");
exports.deleteLicence = (licenceID, reqSession) => {
    const db = sqlite(databasePaths_2.licencesDB);
    const nowMillis = Date.now();
    const info = db.prepare("update LotteryLicences" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where licenceID = ?" +
        " and recordDelete_timeMillis is null")
        .run(reqSession.user.userName, nowMillis, licenceID);
    const changeCount = info.changes;
    if (changeCount) {
        db.prepare("update LotteryEvents" +
            " set recordDelete_userName = ?," +
            " recordDelete_timeMillis = ?" +
            " where licenceID = ?" +
            " and recordDelete_timeMillis is null")
            .run(reqSession.user.userName, nowMillis, licenceID);
    }
    db.close();
    licencesDB_1.resetLicenceTableStats();
    licencesDB_1.resetEventTableStats();
    return changeCount > 0;
};
