"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrganizationBankRecord = void 0;
const _runSQL_1 = require("./_runSQL");
const deleteOrganizationBankRecord = (organizationID, recordIndex, reqSession) => {
    return _runSQL_1.runSQL_hasChanges("update OrganizationBankRecords" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where organizationID = ?" +
        " and recordIndex = ?" +
        " and recordDelete_timeMillis is null", [
        reqSession.user.userName,
        Date.now(),
        organizationID,
        recordIndex
    ]);
};
exports.deleteOrganizationBankRecord = deleteOrganizationBankRecord;
