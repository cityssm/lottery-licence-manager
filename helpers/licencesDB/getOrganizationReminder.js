import sqlite from "better-sqlite3";
import { licencesDB as dbPath } from "../../data/databasePaths.js";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import { canUpdateObject } from "../licencesDB.js";
export const getOrganizationReminder = (organizationID, reminderIndex, reqSession) => {
    const db = sqlite(dbPath, {
        readonly: true
    });
    const reminder = db.prepare("select * from OrganizationReminders" +
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
