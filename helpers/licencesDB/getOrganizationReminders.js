"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrganizationReminders = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
const configFns = require("../configFns");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const licencesDB_1 = require("../licencesDB");
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
    if (reminderA.reminderDateString === "" && reminderB.reminderDateString !== "") {
        return 1;
    }
    if (reminderB.reminderDateString === "" && reminderA.reminderDateString !== "") {
        return -1;
    }
    if (reminderA.dismissedDate !== reminderB.dismissedDate) {
        return reminderB.reminderDate - reminderA.dismissedDate;
    }
    return reminderTypeOrdering[reminderA.reminderTypeKey] - reminderTypeOrdering[reminderB.reminderTypeKey];
};
const sortFn_byConfig = (reminderA, reminderB) => {
    if (reminderA.reminderTypeKey !== reminderB.reminderTypeKey) {
        return reminderTypeOrdering[reminderA.reminderTypeKey] - reminderTypeOrdering[reminderB.reminderTypeKey];
    }
    return sortFn_byDate(reminderA, reminderB);
};
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
        " and organizationID = ?")
        .all(organizationID);
    db.close();
    for (const reminder of reminders) {
        reminder.recordType = "reminder";
        reminder.reminderDateString = dateTimeFns.dateIntegerToString(reminder.reminderDate || 0);
        reminder.dismissedDateString = dateTimeFns.dateIntegerToString(reminder.dismissedDate || 0);
        reminder.canUpdate = licencesDB_1.canUpdateObject(reminder, reqSession);
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
