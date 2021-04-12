"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.issueLicence = void 0;
const _runSQL_1 = require("./_runSQL");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const issueLicence = (licenceID, reqSession) => {
    const nowDate = new Date();
    const issueDate = dateTimeFns.dateToInteger(nowDate);
    const issueTime = dateTimeFns.dateToTimeInteger(nowDate);
    return _runSQL_1.runSQL_hasChanges("update LotteryLicences" +
        " set issueDate = ?," +
        " issueTime = ?," +
        " trackUpdatesAsAmendments = 1," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where licenceID = ?" +
        " and recordDelete_timeMillis is null" +
        " and issueDate is null", [
        issueDate,
        issueTime,
        reqSession.user.userName,
        nowDate.getTime(),
        licenceID
    ]);
};
exports.issueLicence = issueLicence;
