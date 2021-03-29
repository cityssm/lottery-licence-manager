import * as sqlite from "better-sqlite3";

import { licencesDB as dbPath } from "../../data/databasePaths";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";
import { canUpdateObject } from "../licencesDB";

import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";


export const getOrganizationReminder =
  (organizationID: number, reminderIndex: number, reqSession: expressSession.Session) => {

    const db = sqlite(dbPath, {
      readonly: true
    });

    const reminder: llm.OrganizationReminder =
      db.prepare("select * from OrganizationReminders" +
        " where recordDelete_timeMillis is null" +
        " and organizationID = ?" +
        " and reminderIndex = ?")
        .get(organizationID, reminderIndex);

    db.close();

    if (reminder) {

      reminder.recordType = "reminder";

      reminder.dueDateString = dateTimeFns.dateIntegerToString(reminder.dueDate || 0);
      reminder.dismissedDateString = dateTimeFns.dateIntegerToString(reminder.dismissedDate || 0);

      reminder.canUpdate = canUpdateObject(reminder, reqSession);
    }

    return reminder;
  };
