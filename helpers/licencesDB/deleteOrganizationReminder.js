"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrganizationReminder = exports.deleteOrganizationReminderWithDB = void 0;
const _runSQLByName_1 = require("../_runSQLByName");
const databasePaths_1 = require("../../data/databasePaths");
const sqlite = require("better-sqlite3");
const deleteOrganizationReminderWithDB = (db, organizationID, reminderIndex, reqSession) => {
    return _runSQLByName_1.runSQLWithDB(db, "update OrganizationReminders" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where organizationID = ?" +
        " and reminderIndex = ?" +
        " and recordDelete_timeMillis is null", [
        reqSession.user.userName, Date.now(), organizationID, reminderIndex
    ]);
};
exports.deleteOrganizationReminderWithDB = deleteOrganizationReminderWithDB;
const deleteOrganizationReminder = (organizationID, reminderIndex, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB);
    const result = exports.deleteOrganizationReminderWithDB(db, organizationID, reminderIndex, reqSession);
    db.close();
    return result;
};
exports.deleteOrganizationReminder = deleteOrganizationReminder;
