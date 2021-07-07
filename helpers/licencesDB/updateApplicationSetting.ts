import { runSQL_hasChanges } from "./_runSQL.js";

import type * as expressSession from "express-session";


export const updateApplicationSetting =
  (settingKey: string, settingValue: string, requestSession: expressSession.Session): boolean => {

    return runSQL_hasChanges("update ApplicationSettings" +
      " set settingValue = ?," +
      " recordUpdate_userName = ?," +
      " recordUpdate_timeMillis = ?" +
      " where settingKey = ?", [
        settingValue,
        requestSession.user.userName,
        Date.now(),
        settingKey
      ]);
  };
