import sqlite from "better-sqlite3";
import { licencesDB as dbPath } from "../../data/databasePaths.js";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import { canUpdateObject } from "../licencesDB.js";

import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";


export const getOrganizationRemarks = (organizationID: number, reqSession: expressSession.Session) => {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const remarks: llm.OrganizationRemark[] =
    db.prepare("select remarkIndex," +
      " remarkDate, remarkTime," +
      " remark, isImportant," +
      " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis" +
      " from OrganizationRemarks" +
      " where recordDelete_timeMillis is null" +
      " and organizationID = ?" +
      " order by remarkDate desc, remarkTime desc")
      .all(organizationID);

  db.close();

  for (const remark of remarks) {

    remark.recordType = "remark";

    remark.remarkDateString = dateTimeFns.dateIntegerToString(remark.remarkDate || 0);
    remark.remarkTimeString = dateTimeFns.timeIntegerToString(remark.remarkTime || 0);

    remark.canUpdate = canUpdateObject(remark, reqSession);
  }

  return remarks;
};
