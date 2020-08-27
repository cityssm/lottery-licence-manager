"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrganizationReminders = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const licencesDB_1 = require("../licencesDB");
exports.getOrganizationReminders = (organizationID, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB, {
        readonly: true
    });
    const reminders = db.prepare("select reminderIndex," +
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
        reminder.canUpdate = licencesDB_1.canUpdateObject(reminder, reqSession);
    }
    return reminders;
};
