"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pokeLicence = void 0;
const _runSQL_1 = require("./_runSQL");
const pokeLicence = (licenceID, reqSession) => {
    return _runSQL_1.runSQL_hasChanges("update LotteryLicences" +
        " set recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where licenceID = ?" +
        " and recordDelete_timeMillis is null", [
        reqSession.user.userName,
        Date.now(),
        licenceID
    ]);
};
exports.pokeLicence = pokeLicence;
