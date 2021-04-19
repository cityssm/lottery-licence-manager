import { runSQL_hasChanges } from "./_runSQL.js";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";

import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";


export const updateOrganizationBankRecord = (reqBody: llm.OrganizationBankRecord, reqSession: expressSession.Session) => {

  return runSQL_hasChanges("update OrganizationBankRecords" +
    " set recordDate = ?," +
    " recordIsNA = ?," +
    " recordNote = ?," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where organizationID = ?" +
    " and recordIndex = ?" +
    " and recordDelete_timeMillis is null", [
      dateTimeFns.dateStringToInteger(reqBody.recordDateString),
      reqBody.recordIsNA ? 1 : 0,
      reqBody.recordNote,
      reqSession.user.userName,
      Date.now(),
      reqBody.organizationID,
      reqBody.recordIndex]);
};
