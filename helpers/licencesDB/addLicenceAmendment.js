"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addLicenceAmendmentWithDB = void 0;
const getMaxLicenceAmendmentIndex_1 = require("./getMaxLicenceAmendmentIndex");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const addLicenceAmendmentWithDB = (db, licenceID, amendmentType, amendment, isHidden, reqSession) => {
    const newAmendmentIndex = getMaxLicenceAmendmentIndex_1.getMaxLicenceAmendmentIndexWithDB(db, licenceID);
    const nowDate = new Date();
    const amendmentDate = dateTimeFns.dateToInteger(nowDate);
    const amendmentTime = dateTimeFns.dateToTimeInteger(nowDate);
    db.prepare("insert into LotteryLicenceAmendments" +
        " (licenceID, amendmentIndex, amendmentDate, amendmentTime, amendmentType, amendment, isHidden," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(licenceID, newAmendmentIndex, amendmentDate, amendmentTime, amendmentType, amendment, isHidden, reqSession.user.userName, nowDate.getTime(), reqSession.user.userName, nowDate.getTime());
    return newAmendmentIndex;
};
exports.addLicenceAmendmentWithDB = addLicenceAmendmentWithDB;
