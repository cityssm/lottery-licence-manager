"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrganizationBankRecord = void 0;
const _runSQL_1 = require("./_runSQL");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const updateOrganizationBankRecord = (reqBody, reqSession) => {
    return _runSQL_1.runSQL_hasChanges("update OrganizationBankRecords" +
        " set recordDate = ?," +
        " recordIsNA = ?," +
        " recordNote = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where organizationID = ?" +
        " and recordIndex = ?" +
        " and recordDelete_timeMillis is null", [
        dateTimeFns.dateStringToInteger(reqBody.recordDateString),
        reqBody.recordIsNA ? 1 : 0,
        reqBody.recordNote,
        reqSession.user.userName,
        Date.now(),
        reqBody.organizationID,
        reqBody.recordIndex
    ]);
};
exports.updateOrganizationBankRecord = updateOrganizationBankRecord;
