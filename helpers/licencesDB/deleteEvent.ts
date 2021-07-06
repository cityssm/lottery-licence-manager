import { runSQL } from "./_runSQL.js";

import * as licencesDB from "../licencesDB.js";

import type * as expressSession from "express-session";


export const deleteEvent = (licenceID: number, eventDate: number, requestSession: expressSession.Session): boolean => {

  const nowMillis = Date.now();

  const result = runSQL("update LotteryEvents" +
    " set recordDelete_userName = ?," +
    " recordDelete_timeMillis = ?" +
    " where licenceID = ?" +
    " and eventDate = ?" +
    " and recordDelete_timeMillis is null", [
      requestSession.user.userName,
      nowMillis,
      licenceID,
      eventDate
    ]);

  const changeCount = result.changes;

  // Purge cached stats
  licencesDB.resetEventTableStats();

  return changeCount > 0;
};


export default deleteEvent;
