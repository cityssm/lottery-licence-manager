import * as sqlite from "better-sqlite3";

import { getMaxLicenceAmendmentIndexWithDB } from "./getMaxLicenceAmendmentIndex";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";

import type * as expressSession from "express-session";


export const addLicenceAmendmentWithDB = (db: sqlite.Database,
  licenceID: number | string, amendmentType: string, amendment: string, isHidden: number,
  reqSession: expressSession.Session) => {

  const newAmendmentIndex = getMaxLicenceAmendmentIndexWithDB(db, licenceID);

  const nowDate = new Date();

  const amendmentDate = dateTimeFns.dateToInteger(nowDate);
  const amendmentTime = dateTimeFns.dateToTimeInteger(nowDate);

  db.prepare("insert into LotteryLicenceAmendments" +
    " (licenceID, amendmentIndex, amendmentDate, amendmentTime, amendmentType, amendment, isHidden," +
    " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
    " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(
      licenceID,
      newAmendmentIndex,
      amendmentDate,
      amendmentTime,
      amendmentType,
      amendment,
      isHidden,
      reqSession.user.userName,
      nowDate.getTime(),
      reqSession.user.userName,
      nowDate.getTime()
    );

  return newAmendmentIndex;
};
