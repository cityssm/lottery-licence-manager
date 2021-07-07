import sqlite from "better-sqlite3";
import { licencesDB as databasePath } from "../../data/databasePaths.js";

import { addLicenceAmendmentWithDB } from "./addLicenceAmendment.js";

import type * as expressSession from "express-session";


export const unissueLicence = (licenceID: number, requestSession: expressSession.Session): boolean => {

  const database = sqlite(databasePath);

  const nowMillis = Date.now();

  const info = database.prepare("update LotteryLicences" +
    " set issueDate = null," +
    " issueTime = null," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where licenceID = ?" +
    " and recordDelete_timeMillis is null" +
    " and issueDate is not null")
    .run(
      requestSession.user.userName,
      nowMillis,
      licenceID
    );

  const changeCount = info.changes;

  if (changeCount) {

    addLicenceAmendmentWithDB(
      database,
      licenceID,
      "Unissue Licence",
      "",
      1,
      requestSession
    );

  }

  database.close();

  return changeCount > 0;
};
