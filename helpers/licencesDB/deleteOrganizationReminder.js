import { runSQLWithDB } from "../_runSQLByName.js";
import { licencesDB as dbPath } from "../../data/databasePaths.js";
import sqlite from "better-sqlite3";
export const deleteOrganizationReminderWithDB = (db, organizationID, reminderIndex, reqSession) => {
    return runSQLWithDB(db, "update OrganizationReminders" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where organizationID = ?" +
        " and reminderIndex = ?" +
        " and recordDelete_timeMillis is null", [
        reqSession.user.userName,
        Date.now(),
        organizationID,
        reminderIndex
    ]);
};
export const deleteOrganizationReminder = (organizationID, reminderIndex, reqSession) => {
    const db = sqlite(dbPath);
    const result = deleteOrganizationReminderWithDB(db, organizationID, reminderIndex, reqSession);
    db.close();
    return result;
};
