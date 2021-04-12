"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreLocation = void 0;
const _runSQL_1 = require("./_runSQL");
const restoreLocation = (locationID, reqSession) => {
    const nowMillis = Date.now();
    return _runSQL_1.runSQL_hasChanges("update Locations" +
        " set recordDelete_userName = null," +
        " recordDelete_timeMillis = null," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where recordDelete_timeMillis is not null" +
        " and locationID = ?", [
        reqSession.user.userName,
        nowMillis,
        locationID
    ]);
};
exports.restoreLocation = restoreLocation;
