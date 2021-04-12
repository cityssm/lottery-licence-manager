"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrganizationRemark = void 0;
const _runSQL_1 = require("./_runSQL");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const updateOrganizationRemark = (reqBody, reqSession) => {
    return _runSQL_1.runSQL_hasChanges("update OrganizationRemarks" +
        " set remarkDate = ?," +
        " remarkTime = ?," +
        " remark = ?," +
        " isImportant = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where organizationID = ?" +
        " and remarkIndex = ?" +
        " and recordDelete_timeMillis is null", [
        dateTimeFns.dateStringToInteger(reqBody.remarkDateString),
        dateTimeFns.timeStringToInteger(reqBody.remarkTimeString),
        reqBody.remark,
        reqBody.isImportant ? 1 : 0,
        reqSession.user.userName,
        Date.now(),
        reqBody.organizationID,
        reqBody.remarkIndex
    ]);
};
exports.updateOrganizationRemark = updateOrganizationRemark;
