import { runSQL_hasChanges } from "./_runSQL.js";

import type * as expressSession from "express-session";


export const pokeLicence = (licenceID: number, requestSession: expressSession.Session): boolean => {

  return runSQL_hasChanges("update LotteryLicences" +
    " set recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where licenceID = ?" +
    " and recordDelete_timeMillis is null", [
      requestSession.user.userName,
      Date.now(),
      licenceID
    ]);
};
