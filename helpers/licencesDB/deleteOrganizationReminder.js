"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrganizationReminder = exports.deleteOrganizationReminderWithDB = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
const deleteOrganizationReminderWithDB = (db, organizationID, reminderIndex, reqSession) => {
    const info = db.prepare("update OrganizationReminders" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where organizationID = ?" +
        " and reminderIndex = ?" +
        " and recordDelete_timeMillis is null")
        .run(reqSession.user.userName, Date.now(), organizationID, reminderIndex);
    return info.changes > 0;
};
exports.deleteOrganizationReminderWithDB = deleteOrganizationReminderWithDB;
const deleteOrganizationReminder = (organizationID, reminderIndex, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB);
    const result = exports.deleteOrganizationReminderWithDB(db, organizationID, reminderIndex, reqSession);
    db.close();
    return result;
};
exports.deleteOrganizationReminder = deleteOrganizationReminder;
