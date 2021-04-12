"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEvent = void 0;
const _runSQL_1 = require("./_runSQL");
const licencesDB = require("../licencesDB");
const deleteEvent = (licenceID, eventDate, reqSession) => {
    const nowMillis = Date.now();
    const result = _runSQL_1.runSQL("update LotteryEvents" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where licenceID = ?" +
        " and eventDate = ?" +
        " and recordDelete_timeMillis is null", [
        reqSession.user.userName,
        nowMillis,
        licenceID,
        eventDate
    ]);
    const changeCount = result.changes;
    licencesDB.resetEventTableStats();
    return changeCount > 0;
};
exports.deleteEvent = deleteEvent;
