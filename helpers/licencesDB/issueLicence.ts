import { runSQL_hasChanges } from "./_runSQL";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";

import type * as expressSession from "express-session";


export const issueLicence = (licenceID: number, reqSession: expressSession.Session) => {

  const nowDate = new Date();

  const issueDate = dateTimeFns.dateToInteger(nowDate);
  const issueTime = dateTimeFns.dateToTimeInteger(nowDate);

  return runSQL_hasChanges("update LotteryLicences" +
    " set issueDate = ?," +
    " issueTime = ?," +
    " trackUpdatesAsAmendments = 1," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where licenceID = ?" +
    " and recordDelete_timeMillis is null" +
    " and issueDate is null", [
      issueDate,
      issueTime,
      reqSession.user.userName,
      nowDate.getTime(),
      licenceID
    ]);
};
