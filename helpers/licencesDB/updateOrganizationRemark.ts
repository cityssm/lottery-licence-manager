import { runSQL_hasChanges } from "./_runSQL.js";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";

import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";


export const updateOrganizationRemark = (requestBody: llm.OrganizationRemark, requestSession: expressSession.Session): boolean => {

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
      dateTimeFns.dateStringToInteger(requestBody.remarkDateString),
      dateTimeFns.timeStringToInteger(requestBody.remarkTimeString),
      requestBody.remark,
      requestBody.isImportant ? 1 : 0,
      requestSession.user.userName,
      Date.now(),
      requestBody.organizationID,
      requestBody.remarkIndex
    ]);
};
