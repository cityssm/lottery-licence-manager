import * as sqlite from "better-sqlite3";

import { getMaxOrganizationRemarkIndexWithDB } from "./getMaxOrganizationRemarkIndex";

import { licencesDB as dbPath } from "../../data/databasePaths";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";

import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";


export const addOrganizationRemark = (reqBody: llm.OrganizationRemark, reqSession: expressSession.Session) => {

  const db = sqlite(dbPath);

  const newRemarkIndex = getMaxOrganizationRemarkIndexWithDB(db, reqBody.organizationID) + 1;

  const rightNow = new Date();

  const remarkDate = dateTimeFns.dateToInteger(rightNow);
  const remarkTime = dateTimeFns.dateToTimeInteger(rightNow);

  db.prepare("insert into OrganizationRemarks (" +
    "organizationID, remarkIndex," +
    " remarkDate, remarkTime, remark, isImportant," +
    " recordCreate_userName, recordCreate_timeMillis," +
    " recordUpdate_userName, recordUpdate_timeMillis)" +
    " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(
      reqBody.organizationID, newRemarkIndex,
      remarkDate, remarkTime,
      reqBody.remark, 0,
      reqSession.user.userName,
      rightNow.getTime(),
      reqSession.user.userName,
      rightNow.getTime()
    );

  db.close();

  return newRemarkIndex;
};
