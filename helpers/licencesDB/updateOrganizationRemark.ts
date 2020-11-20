import * as sqlite from "better-sqlite3";

import { licencesDB as dbPath } from "../../data/databasePaths";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";

import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";


export const updateOrganizationRemark = (reqBody: llm.OrganizationRemark, reqSession: expressSession.Session) => {

  const db = sqlite(dbPath);

  const nowMillis = Date.now();

  const info = db.prepare("update OrganizationRemarks" +
    " set remarkDate = ?," +
    " remarkTime = ?," +
    " remark = ?," +
    " isImportant = ?," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where organizationID = ?" +
    " and remarkIndex = ?" +
    " and recordDelete_timeMillis is null")
    .run(
      dateTimeFns.dateStringToInteger(reqBody.remarkDateString),
      dateTimeFns.timeStringToInteger(reqBody.remarkTimeString),
      reqBody.remark,
      reqBody.isImportant ? 1 : 0,
      reqSession.user.userName,
      nowMillis,
      reqBody.organizationID,
      reqBody.remarkIndex
    );

  db.close();

  return info.changes > 0;
};
