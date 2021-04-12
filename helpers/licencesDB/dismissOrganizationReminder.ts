import { runSQL_hasChanges } from "./_runSQL";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";

import type * as expressSession from "express-session";


export const dismissOrganizationReminder =
  (organizationID: number, reminderIndex: number, reqSession: expressSession.Session) => {

    const currentDate = new Date();

    return runSQL_hasChanges("update OrganizationReminders" +
      " set dismissedDate = ?," +
      " recordUpdate_userName = ?," +
      " recordUpdate_timeMillis = ?" +
      " where organizationID = ?" +
      " and reminderIndex = ?" +
      " and dismissedDate is null" +
      " and recordDelete_timeMillis is null", [
        dateTimeFns.dateToInteger(currentDate),
        reqSession.user.userName,
        currentDate.getTime(),
        organizationID,
        reminderIndex]);
  };
