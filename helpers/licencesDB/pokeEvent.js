"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pokeEvent = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_2 = require("../../data/databasePaths");
exports.pokeEvent = (licenceID, eventDate, reqSession) => {
    const db = sqlite(databasePaths_2.licencesDB);
    const nowMillis = Date.now();
    const info = db.prepare("update LotteryEvents" +
        " set recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where licenceID = ?" +
        " and eventDate = ?" +
        " and recordDelete_timeMillis is null")
        .run(reqSession.user.userName, nowMillis, licenceID, eventDate);
    db.close();
    return info.changes > 0;
};
