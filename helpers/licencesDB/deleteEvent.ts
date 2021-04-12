import { runSQL } from "./_runSQL";

import * as licencesDB from "../licencesDB";

import type * as expressSession from "express-session";


export const deleteEvent = (licenceID: number, eventDate: number, reqSession: expressSession.Session) => {

  const nowMillis = Date.now();

  const result = runSQL("update LotteryEvents" +
    " set recordDelete_userName = ?," +
    " recordDelete_timeMillis = ?" +
    " where licenceID = ?" +
    " and eventDate = ?" +
    " and recordDelete_timeMillis is null", [
      reqSession.user.userName,
      nowMillis,
      licenceID,
      eventDate
    ]);

  const changeCount = result.changes;

  // Purge cached stats
  licencesDB.resetEventTableStats();

  return changeCount > 0;
};
