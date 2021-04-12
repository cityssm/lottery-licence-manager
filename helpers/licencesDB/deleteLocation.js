"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLocation = void 0;
const _runSQL_1 = require("./_runSQL");
const deleteLocation = (locationID, reqSession) => {
    return _runSQL_1.runSQL_hasChanges("update Locations" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where recordDelete_timeMillis is null" +
        " and locationID = ?", [
        reqSession.user.userName,
        Date.now(),
        locationID
    ]);
};
exports.deleteLocation = deleteLocation;
