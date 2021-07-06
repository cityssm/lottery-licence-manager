import { runSQL_hasChanges } from "./_runSQL.js";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";

import type * as expressSession from "express-session";


export const dismissOrganizationReminder =
  (organizationID: number, reminderIndex: number, requestSession: expressSession.Session): boolean => {

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
        requestSession.user.userName,
        currentDate.getTime(),
        organizationID,
        reminderIndex]);
  };
