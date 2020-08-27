"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.issueLicence = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
exports.issueLicence = (licenceID, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB);
    const nowDate = new Date();
    const issueDate = dateTimeFns.dateToInteger(nowDate);
    const issueTime = dateTimeFns.dateToTimeInteger(nowDate);
    const info = db.prepare("update LotteryLicences" +
        " set issueDate = ?," +
        " issueTime = ?," +
        " trackUpdatesAsAmendments = 1," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where licenceID = ?" +
        " and recordDelete_timeMillis is null" +
        " and issueDate is null")
        .run(issueDate, issueTime, reqSession.user.userName, nowDate.getTime(), licenceID);
    db.close();
    return info.changes > 0;
};
