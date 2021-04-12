"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrganizationRemark = void 0;
const _runSQL_1 = require("./_runSQL");
const deleteOrganizationRemark = (organizationID, remarkIndex, reqSession) => {
    return _runSQL_1.runSQL_hasChanges("update OrganizationRemarks" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where organizationID = ?" +
        " and remarkIndex = ?" +
        " and recordDelete_timeMillis is null", [
        reqSession.user.userName,
        Date.now(),
        organizationID,
        remarkIndex
    ]);
};
exports.deleteOrganizationRemark = deleteOrganizationRemark;
