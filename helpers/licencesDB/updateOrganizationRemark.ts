import { runSQL_hasChanges } from "./_runSQL";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";

import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";


export const updateOrganizationRemark = (reqBody: llm.OrganizationRemark, reqSession: expressSession.Session) => {

  return runSQL_hasChanges("update OrganizationRemarks" +
    " set remarkDate = ?," +
    " remarkTime = ?," +
    " remark = ?," +
    " isImportant = ?," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where organizationID = ?" +
    " and remarkIndex = ?" +
    " and recordDelete_timeMillis is null", [
      dateTimeFns.dateStringToInteger(reqBody.remarkDateString),
      dateTimeFns.timeStringToInteger(reqBody.remarkTimeString),
      reqBody.remark,
      reqBody.isImportant ? 1 : 0,
      reqSession.user.userName,
      Date.now(),
      reqBody.organizationID,
      reqBody.remarkIndex
    ]);
};
