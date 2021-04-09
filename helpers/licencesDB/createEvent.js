"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEventWithDB = void 0;
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const createEventWithDB = (db, licenceID, eventDateString, reqSession) => {
    const nowMillis = Date.now();
    db.prepare("insert or ignore into LotteryEvents (" +
        "licenceID, eventDate," +
        " recordCreate_userName, recordCreate_timeMillis," +
        " recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?)")
        .run(licenceID, dateTimeFns.dateStringToInteger(eventDateString), reqSession.user.userName, nowMillis, reqSession.user.userName, nowMillis);
};
exports.createEventWithDB = createEventWithDB;
