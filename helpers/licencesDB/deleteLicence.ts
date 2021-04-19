import sqlite from "better-sqlite3";
import { licencesDB as dbPath } from "../../data/databasePaths.js";

import { resetEventTableStats, resetLicenceTableStats } from "../licencesDB.js";

import type * as expressSession from "express-session";


export const deleteLicence = (licenceID: number, reqSession: expressSession.Session) => {

  const db = sqlite(dbPath);

  const nowMillis = Date.now();

  const info = db.prepare("update LotteryLicences" +
    " set recordDelete_userName = ?," +
    " recordDelete_timeMillis = ?" +
    " where licenceID = ?" +
    " and recordDelete_timeMillis is null")
    .run(
      reqSession.user.userName,
      nowMillis,
      licenceID
    );

  const changeCount = info.changes;

  if (changeCount) {

    db.prepare("update LotteryEvents" +
      " set recordDelete_userName = ?," +
      " recordDelete_timeMillis = ?" +
      " where licenceID = ?" +
      " and recordDelete_timeMillis is null")
      .run(
        reqSession.user.userName,
        nowMillis,
        licenceID
      );

  }

  db.close();

  // Reset the cached stats
  resetLicenceTableStats();
  resetEventTableStats();

  return changeCount > 0;
};
