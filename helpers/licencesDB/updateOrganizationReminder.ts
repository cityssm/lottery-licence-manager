import { runSQL_hasChanges } from "./_runSQL";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";

import type * as expressSession from "express-session";


export const updateOrganizationReminder = (reqBody: {
  organizationID: string;
  reminderIndex: string;
  reminderTypeKey: string;
  dueDateString?: string;
  reminderStatus: string;
  reminderNote: string;
  dismissedDateString: string;
}, reqSession: expressSession.Session) => {

  return runSQL_hasChanges("update OrganizationReminders" +
    " set reminderTypeKey = ?," +
    " dueDate = ?," +
    " reminderStatus = ?," +
    " reminderNote = ?," +
    " dismissedDate = ?," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where organizationID = ?" +
    " and reminderIndex = ?" +
    " and recordDelete_timeMillis is null", [
      reqBody.reminderTypeKey,
      (reqBody.dueDateString === ""
        ? null
        : dateTimeFns.dateStringToInteger(reqBody.dueDateString)),
      reqBody.reminderStatus,
      reqBody.reminderNote,
      (reqBody.dismissedDateString === ""
        ? null
        : dateTimeFns.dateStringToInteger(reqBody.dismissedDateString)),
      reqSession.user.userName,
      Date.now(),
      reqBody.organizationID,
      reqBody.reminderIndex
    ]);
};
