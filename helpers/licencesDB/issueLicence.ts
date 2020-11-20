import * as sqlite from "better-sqlite3";
import { licencesDB as dbPath } from "../../data/databasePaths";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";

import type * as expressSession from "express-session";


export const issueLicence = (licenceID: number, reqSession: expressSession.Session) => {

  const db = sqlite(dbPath);

  const nowDate = new Date();

  const issueDate = dateTimeFns.dateToInteger(nowDate);
  const issueTime = dateTimeFns.dateToTimeInteger(nowDate);

  const info = db.prepare("update LotteryLicences" +
    " set issueDate = ?," +
    " issueTime = ?," +
    " trackUpdatesAsAmendments = 1," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where licenceID = ?" +
    " and recordDelete_timeMillis is null" +
    " and issueDate is null")
    .run(
      issueDate,
      issueTime,
      reqSession.user.userName,
      nowDate.getTime(),
      licenceID
    );

  db.close();

  return info.changes > 0;
};
