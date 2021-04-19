import { runSQL_hasChanges } from "./_runSQL.js";

import type * as expressSession from "express-session";


export const deleteLocation = (locationID: number, reqSession: expressSession.Session): boolean => {

  return runSQL_hasChanges("update Locations" +
    " set recordDelete_userName = ?," +
    " recordDelete_timeMillis = ?" +
    " where recordDelete_timeMillis is null" +
    " and locationID = ?", [
      reqSession.user.userName,
      Date.now(),
      locationID
    ]);
};
