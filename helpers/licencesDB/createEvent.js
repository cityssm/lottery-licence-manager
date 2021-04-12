"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEventWithDB = void 0;
const _runSQLByName_1 = require("../_runSQLByName");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const createEventWithDB = (db, licenceID, eventDateString, reqSession) => {
    const nowMillis = Date.now();
    _runSQLByName_1.runSQLWithDB(db, "insert or ignore into LotteryEvents (" +
        "licenceID, eventDate," +
        " recordCreate_userName, recordCreate_timeMillis," +
        " recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?)", [
        licenceID,
        dateTimeFns.dateStringToInteger(eventDateString),
        reqSession.user.userName,
        nowMillis,
        reqSession.user.userName,
        nowMillis
    ]);
};
exports.createEventWithDB = createEventWithDB;
