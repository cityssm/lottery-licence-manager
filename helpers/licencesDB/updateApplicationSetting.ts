import { runSQL_hasChanges } from "./_runSQL.js";

import type * as expressSession from "express-session";


export const updateApplicationSetting =
  (settingKey: string, settingValue: string, reqSession: expressSession.Session) => {

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
