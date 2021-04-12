"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pokeEvent = void 0;
const _runSQL_1 = require("./_runSQL");
const pokeEvent = (licenceID, eventDate, reqSession) => {
    return _runSQL_1.runSQL_hasChanges("update LotteryEvents" +
        " set recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where licenceID = ?" +
        " and eventDate = ?" +
        " and recordDelete_timeMillis is null", [
        reqSession.user.userName,
        Date.now(),
        licenceID,
        eventDate
    ]);
};
exports.pokeEvent = pokeEvent;
