"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrganization = void 0;
const _runSQL_1 = require("./_runSQL");
const deleteOrganization = (organizationID, reqSession) => {
    return _runSQL_1.runSQL_hasChanges("update Organizations" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where organizationID = ?" +
        " and recordDelete_timeMillis is null", [
        reqSession.user.userName,
        Date.now(),
        organizationID
    ]);
};
exports.deleteOrganization = deleteOrganization;
