"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUndismissedOrganizationReminders = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const licencesDB_1 = require("../licencesDB");
const getUndismissedOrganizationReminders = (reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB, {
        readonly: true
    });
    const reminders = db.prepare("select r.organizationID, o.organizationName, r.reminderIndex," +
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
    db.close();
    for (const reminder of reminders) {
        reminder.recordType = "reminder";
        reminder.dueDateString = dateTimeFns.dateIntegerToString(reminder.dueDate || 0);
        reminder.canUpdate = licencesDB_1.canUpdateObject(reminder, reqSession);
    }
    return reminders;
};
exports.getUndismissedOrganizationReminders = getUndismissedOrganizationReminders;
