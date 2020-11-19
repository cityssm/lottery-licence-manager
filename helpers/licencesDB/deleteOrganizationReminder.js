"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrganizationReminder = exports.deleteOrganizationReminderWithDB = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_2 = require("../../data/databasePaths");
exports.deleteOrganizationReminderWithDB = (db, organizationID, reminderIndex, reqSession) => {
    const info = db.prepare("update OrganizationReminders" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where organizationID = ?" +
        " and reminderIndex = ?" +
        " and recordDelete_timeMillis is null")
        .run(reqSession.user.userName, Date.now(), organizationID, reminderIndex);
    return info.changes > 0;
};
exports.deleteOrganizationReminder = (organizationID, reminderIndex, reqSession) => {
    const db = sqlite(databasePaths_2.licencesDB);
    const result = exports.deleteOrganizationReminderWithDB(db, organizationID, reminderIndex, reqSession);
    db.close();
    return result;
};
