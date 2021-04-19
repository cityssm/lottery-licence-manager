import sqlite from "better-sqlite3";
import { licencesDB as dbPath } from "../../data/databasePaths.js";
import * as configFns from "../configFns.js";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import { canUpdateObject } from "../licencesDB.js";
const reminderTypeOrdering = {};
const reminderCategories = configFns.getProperty("reminderCategories");
(() => {
    let typeIndex = 0;
    for (const reminderCategory of reminderCategories) {
        for (const reminderType of reminderCategory.reminderTypes) {
            typeIndex += 1;
            reminderTypeOrdering[reminderType.reminderTypeKey] = typeIndex;
        }
    }
})();
const sortFn_byDate = (reminderA, reminderB) => {
    if (reminderA.dismissedDateString === "" && reminderB.dismissedDateString !== "") {
        return -1;
    }
    if (reminderB.dismissedDateString === "" && reminderA.dismissedDateString !== "") {
        return 1;
    }
    if (reminderA.dueDateString === "" && reminderB.dueDateString !== "") {
        return 1;
    }
    if (reminderB.dueDateString === "" && reminderA.dueDateString !== "") {
        return -1;
    }
    if (reminderA.dismissedDate !== reminderB.dismissedDate) {
        return reminderB.dueDate - reminderA.dismissedDate;
    }
    return reminderTypeOrdering[reminderA.reminderTypeKey] - reminderTypeOrdering[reminderB.reminderTypeKey];
};
const sortFn_byConfig = (reminderA, reminderB) => {
    if (reminderA.reminderTypeKey !== reminderB.reminderTypeKey) {
        return reminderTypeOrdering[reminderA.reminderTypeKey] - reminderTypeOrdering[reminderB.reminderTypeKey];
    }
    return sortFn_byDate(reminderA, reminderB);
};
export const getOrganizationRemindersWithDB = (db, organizationID, reqSession) => {
    const reminders = db.prepare("select reminderIndex," +
        " reminderTypeKey, dueDate, dismissedDate," +
        " reminderStatus, reminderNote," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis" +
        " from OrganizationReminders" +
        " where recordDelete_timeMillis is null" +
        " and organizationID = ?")
        .all(organizationID);
    for (const reminder of reminders) {
        reminder.recordType = "reminder";
        reminder.dueDateString = dateTimeFns.dateIntegerToString(reminder.dueDate || 0);
        reminder.dismissedDateString = dateTimeFns.dateIntegerToString(reminder.dismissedDate || 0);
        reminder.canUpdate = canUpdateObject(reminder, reqSession);
    }
    switch (configFns.getProperty("reminders.preferredSortOrder")) {
        case "date":
            reminders.sort(sortFn_byDate);
            break;
        case "config":
            reminders.sort(sortFn_byConfig);
            break;
    }
    return reminders;
};
export const getOrganizationReminders = (organizationID, reqSession) => {
    const db = sqlite(dbPath, {
        readonly: true
    });
    const reminders = getOrganizationRemindersWithDB(db, organizationID, reqSession);
    db.close();
    return reminders;
};
