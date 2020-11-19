import * as sqlite from "better-sqlite3";

import { licencesDB as dbPath } from "../../data/databasePaths";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";

import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";


export const updateOrganizationBankRecord = (reqBody: llm.OrganizationBankRecord, reqSession: expressSession.Session) => {

  const db = sqlite(dbPath);

  const nowMillis = Date.now();

  const info = db.prepare("update OrganizationBankRecords" +
    " set recordDate = ?," +
    " recordIsNA = ?," +
    " recordNote = ?," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where organizationID = ?" +
    " and recordIndex = ?" +
    " and recordDelete_timeMillis is null")
    .run(dateTimeFns.dateStringToInteger(reqBody.recordDateString),
      reqBody.recordIsNA ? 1 : 0,
      reqBody.recordNote,
      reqSession.user.userName,
      nowMillis,
      reqBody.organizationID,
      reqBody.recordIndex);

  db.close();

  return info.changes > 0;
};
