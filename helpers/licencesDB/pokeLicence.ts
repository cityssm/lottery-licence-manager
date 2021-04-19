import { runSQL_hasChanges } from "./_runSQL.js";

import type * as expressSession from "express-session";


export const pokeLicence = (licenceID: number, reqSession: expressSession.Session) => {

  return runSQL_hasChanges("update LotteryLicences" +
    " set recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where licenceID = ?" +
    " and recordDelete_timeMillis is null", [
      reqSession.user.userName,
      Date.now(),
      licenceID
    ]);
};
