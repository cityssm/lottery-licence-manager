import * as sqlite from "better-sqlite3";
import { licencesDB as dbPath } from "../../data/databasePaths";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";
import { canUpdateObject } from "../licencesDB";

import type * as llm from "../../types/recordTypes";


export const getUndismissedOrganizationReminders = (reqSession: Express.SessionData) => {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const reminders: llm.OrganizationReminder[] =
    db.prepare("select r.organizationID, o.organizationName, r.reminderIndex," +
      " r.reminderTypeKey, r.reminderDate," +
      " r.reminderStatus, r.reminderNote," +
      " r.recordUpdate_userName, r.recordUpdate_timeMillis" +
      " from OrganizationReminders r" +
      " left join Organizations o on r.organizationID = o.organizationID" +
      " where r.recordDelete_timeMillis is null" +
      " and o.recordDelete_timeMillis is null" +
      " and r.dismissedDate is null" +
      " order by r.reminderDate, o.organizationName, r.reminderTypeKey")
      .all();

  db.close();

  for (const reminder of reminders) {

    reminder.recordType = "reminder";

    reminder.reminderDateString = dateTimeFns.dateIntegerToString(reminder.reminderDate || 0);

    reminder.canUpdate = canUpdateObject(reminder, reqSession);
  }

  return reminders;
};
