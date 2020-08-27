"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addLicenceAmendmentWithDB = void 0;
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
exports.addLicenceAmendmentWithDB = (db, licenceID, amendmentType, amendment, isHidden, reqSession) => {
    const amendmentIndexRecord = db.prepare("select amendmentIndex" +
        " from LotteryLicenceAmendments" +
        " where licenceID = ?" +
        " order by amendmentIndex desc" +
        " limit 1")
        .get(licenceID);
    const amendmentIndex = (amendmentIndexRecord ? amendmentIndexRecord.amendmentIndex : 0) + 1;
    const nowDate = new Date();
    const amendmentDate = dateTimeFns.dateToInteger(nowDate);
    const amendmentTime = dateTimeFns.dateToTimeInteger(nowDate);
    db.prepare("insert into LotteryLicenceAmendments" +
        " (licenceID, amendmentIndex, amendmentDate, amendmentTime, amendmentType, amendment, isHidden," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(licenceID, amendmentIndex, amendmentDate, amendmentTime, amendmentType, amendment, isHidden, reqSession.user.userName, nowDate.getTime(), reqSession.user.userName, nowDate.getTime());
    return amendmentIndex;
};
