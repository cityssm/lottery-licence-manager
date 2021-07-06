import sqlite from "better-sqlite3";

import { licencesDB as databasePath } from "../../data/databasePaths.js";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import { canUpdateObject } from "../licencesDB.js";

import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";


export const getOrganizationReminder =
  (organizationID: number, reminderIndex: number, requestSession: expressSession.Session): llm.OrganizationReminder => {

    const database = sqlite(databasePath, {
      readonly: true
    });

    const reminder: llm.OrganizationReminder =
      database.prepare("select * from OrganizationReminders" +
        " where recordDelete_timeMillis is null" +
        " and organizationID = ?" +
        " and reminderIndex = ?")
        .get(organizationID, reminderIndex);

    database.close();

    if (reminder) {

      reminder.recordType = "reminder";

      reminder.dueDateString = dateTimeFns.dateIntegerToString(reminder.dueDate || 0);
      reminder.dismissedDateString = dateTimeFns.dateIntegerToString(reminder.dismissedDate || 0);

      reminder.canUpdate = canUpdateObject(reminder, requestSession);
    }

    return reminder;
  };
