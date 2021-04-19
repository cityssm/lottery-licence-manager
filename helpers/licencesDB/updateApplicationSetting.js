import { runSQL_hasChanges } from "./_runSQL.js";
export const updateApplicationSetting = (settingKey, settingValue, reqSession) => {
    return runSQL_hasChanges("update ApplicationSettings" +
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
