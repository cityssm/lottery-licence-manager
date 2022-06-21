import { licencesDB as databasePath } from "../../data/databasePaths.js";
import sqlite from "better-sqlite3";
export const deleteOrganizationReminderWithDB = (database, organizationID, reminderIndex, requestSession) => {
    const result = database.prepare("update OrganizationReminders" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where organizationID = ?" +
        " and reminderIndex = ?" +
        " and recordDelete_timeMillis is null")
        .run(requestSession.user.userName, Date.now(), organizationID, reminderIndex);
    return result.changes > 0;
};
export const deleteOrganizationReminder = (organizationID, reminderIndex, requestSession) => {
    const database = sqlite(databasePath);
    const hasChanges = deleteOrganizationReminderWithDB(database, organizationID, reminderIndex, requestSession);
    database.close();
    return hasChanges;
};
