"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreOrganization = void 0;
const _runSQL_1 = require("./_runSQL");
const restoreOrganization = (organizationID, reqSession) => {
    const nowMillis = Date.now();
    return _runSQL_1.runSQL_hasChanges("update Organizations" +
        " set recordDelete_userName = null," +
        " recordDelete_timeMillis = null," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where organizationID = ?" +
        " and recordDelete_timeMillis is not null", [
        reqSession.user.userName,
        nowMillis,
        organizationID
    ]);
};
exports.restoreOrganization = restoreOrganization;
