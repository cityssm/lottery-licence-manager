import * as sqlite from "better-sqlite3";

import * as licencesDB from "../licencesDB";

import { licencesDB as dbPath } from "../../data/databasePaths";

import type * as expressSession from "express-session";


export const deleteEvent = (licenceID: number, eventDate: number, reqSession: expressSession.Session) => {

  const db = sqlite(dbPath);

  const nowMillis = Date.now();

  const info = db.prepare("update LotteryEvents" +
    " set recordDelete_userName = ?," +
    " recordDelete_timeMillis = ?" +
    " where licenceID = ?" +
    " and eventDate = ?" +
    " and recordDelete_timeMillis is null")
    .run(
      reqSession.user.userName,
      nowMillis,
      licenceID,
      eventDate
    );

  const changeCount = info.changes;

  db.close();

  // Purge cached stats
  licencesDB.resetEventTableStats();

  return changeCount > 0;
};
