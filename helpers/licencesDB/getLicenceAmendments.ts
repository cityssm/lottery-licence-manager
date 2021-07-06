import sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";

import type * as llm from "../../types/recordTypes";


export const getLicenceAmendmentsWithDB = (database: sqlite.Database, licenceID: number | string): llm.LotteryLicenceAmendment[] => {

  const amendments: llm.LotteryLicenceAmendment[] = database.prepare("select *" +
    " from LotteryLicenceAmendments" +
    " where licenceID = ?" +
    " and recordDelete_timeMillis is null" +
    " order by amendmentDate, amendmentTime, amendmentIndex")
    .all(licenceID);

  for (const amendmentObject of amendments) {
    amendmentObject.amendmentDateString = dateTimeFns.dateIntegerToString(amendmentObject.amendmentDate);
    amendmentObject.amendmentTimeString = dateTimeFns.timeIntegerToString(amendmentObject.amendmentTime);
  }

  return amendments;
};
