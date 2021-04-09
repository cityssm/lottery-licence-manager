"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEvent = void 0;
const sqlite = require("better-sqlite3");
const licencesDB = require("../licencesDB");
const databasePaths_1 = require("../../data/databasePaths");
const deleteEvent = (licenceID, eventDate, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB);
    const nowMillis = Date.now();
    const info = db.prepare("update LotteryEvents" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where licenceID = ?" +
        " and eventDate = ?" +
        " and recordDelete_timeMillis is null")
        .run(reqSession.user.userName, nowMillis, licenceID, eventDate);
    const changeCount = info.changes;
    db.close();
    licencesDB.resetEventTableStats();
    return changeCount > 0;
};
exports.deleteEvent = deleteEvent;
