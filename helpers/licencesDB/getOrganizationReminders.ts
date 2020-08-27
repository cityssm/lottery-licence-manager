import * as sqlite from "better-sqlite3";
import { licencesDB as dbPath } from "../../data/databasePaths";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";
import { canUpdateObject } from "../licencesDB";

import type * as llm from "../../types/recordTypes";


export const getOrganizationReminders = (organizationID: number, reqSession: Express.SessionData) => {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const reminders: llm.OrganizationReminder[] =
    db.prepare("select reminderIndex," +
      " reminderTypeKey, reminderDate, dismissedDate," +
      " reminderStatus, reminderNote," +
      " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis" +
      " from OrganizationReminders" +
      " where recordDelete_timeMillis is null" +
      " and organizationID = ?" +
      " order by case when dismissedDate is null then 0 else 1 end, reminderDate desc, dismissedDate desc")
      .all(organizationID);

  db.close();

  for (const reminder of reminders) {

    reminder.recordType = "reminder";

    reminder.reminderDateString = dateTimeFns.dateIntegerToString(reminder.reminderDate || 0);
    reminder.dismissedDateString = dateTimeFns.dateIntegerToString(reminder.dismissedDate || 0);

    reminder.canUpdate = canUpdateObject(reminder, reqSession);
  }

  return reminders;
};
