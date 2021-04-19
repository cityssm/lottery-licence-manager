import { runSQL_hasChanges } from "./_runSQL.js";

import type * as expressSession from "express-session";


export const pokeEvent = (licenceID: number, eventDate: number, reqSession: expressSession.Session) => {

  return runSQL_hasChanges("update LotteryEvents" +
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
