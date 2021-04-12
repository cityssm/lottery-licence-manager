"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateApplicationSetting = void 0;
const _runSQL_1 = require("./_runSQL");
const updateApplicationSetting = (settingKey, settingValue, reqSession) => {
    return _runSQL_1.runSQL_hasChanges("update ApplicationSettings" +
        " set settingValue = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where settingKey = ?", [
        settingValue,
        reqSession.user.userName,
        Date.now(),
        settingKey
    ]);
};
exports.updateApplicationSetting = updateApplicationSetting;
