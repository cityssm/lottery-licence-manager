import { runSQL_hasChanges } from "./_runSQL.js";

import type * as expressSession from "express-session";


export const restoreLocation = (locationID: number, requestSession: expressSession.Session): boolean => {

  const nowMillis = Date.now();

  return runSQL_hasChanges("update Locations" +
    " set recordDelete_userName = null," +
    " recordDelete_timeMillis = null," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where recordDelete_timeMillis is not null" +
    " and locationID = ?", [
      requestSession.user.userName,
      nowMillis,
      locationID
    ]);
};
