import sqlite from "better-sqlite3";
import { licencesDB as dbPath } from "../../data/databasePaths.js";

import { addLicenceAmendmentWithDB } from "./addLicenceAmendment.js";

import type * as expressSession from "express-session";


export const unissueLicence = (licenceID: number, reqSession: expressSession.Session) => {

  const db = sqlite(dbPath);

  const nowMillis = Date.now();

  const info = db.prepare("update LotteryLicences" +
    " set issueDate = null," +
    " issueTime = null," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where licenceID = ?" +
    " and recordDelete_timeMillis is null" +
    " and issueDate is not null")
    .run(
      reqSession.user.userName,
      nowMillis,
      licenceID
    );

  const changeCount = info.changes;

  if (changeCount) {

    addLicenceAmendmentWithDB(
      db,
      licenceID,
      "Unissue Licence",
      "",
      1,
      reqSession
    );

  }

  db.close();

  return changeCount > 0;
};
