import sqlite from "better-sqlite3";
import { licencesDB as databasePath } from "../../data/databasePaths.js";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import { canUpdateObject } from "../licencesDB.js";
export const getUndismissedOrganizationReminders = (requestSession) => {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const reminders = database.prepare("select r.organizationID, o.organizationName, r.reminderIndex," +
        " r.reminderTypeKey, r.dueDate," +
        " r.reminderStatus, r.reminderNote," +
        " r.recordUpdate_userName, r.recordUpdate_timeMillis" +
        " from OrganizationReminders r" +
        " left join Organizations o on r.organizationID = o.organizationID" +
        " where r.recordDelete_timeMillis is null" +
        " and o.recordDelete_timeMillis is null" +
        " and r.dismissedDate is null" +
        " order by r.dueDate, o.organizationName, r.reminderTypeKey")
        .all();
    database.close();
    for (const reminder of reminders) {
        reminder.recordType = "reminder";
        reminder.dueDateString = dateTimeFns.dateIntegerToString(reminder.dueDate || 0);
        reminder.canUpdate = canUpdateObject(reminder, requestSession);
    }
    return reminders;
};
