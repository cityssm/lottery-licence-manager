import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js';
import sqlite from 'better-sqlite3';
import { licencesDB as databasePath } from '../../data/databasePaths.js';
import * as configFunctions from '../functions.config.js';
import { canUpdateObject } from '../licencesDB.js';
const reminderTypeOrdering = {};
const reminderCategories = configFunctions.getProperty('reminderCategories');
(() => {
    let typeIndex = 0;
    for (const reminderCategory of reminderCategories) {
        for (const reminderType of reminderCategory.reminderTypes) {
            typeIndex += 1;
            reminderTypeOrdering[reminderType.reminderTypeKey] = typeIndex;
        }
    }
})();
function sortFunction_byDate(reminderA, reminderB) {
    if (reminderA.dismissedDateString === '' &&
        reminderB.dismissedDateString !== '') {
        return -1;
    }
    if (reminderB.dismissedDateString === '' &&
        reminderA.dismissedDateString !== '') {
        return 1;
    }
    if (reminderA.dueDateString === '' && reminderB.dueDateString !== '') {
        return 1;
    }
    if (reminderB.dueDateString === '' && reminderA.dueDateString !== '') {
        return -1;
    }
    if (reminderA.dismissedDate !== reminderB.dismissedDate) {
        return reminderB.dueDate - reminderA.dismissedDate;
    }
    return (reminderTypeOrdering[reminderA.reminderTypeKey] -
        reminderTypeOrdering[reminderB.reminderTypeKey]);
}
function sortFunction_byConfig(reminderA, reminderB) {
    if (reminderA.reminderTypeKey !== reminderB.reminderTypeKey) {
        return (reminderTypeOrdering[reminderA.reminderTypeKey] -
            reminderTypeOrdering[reminderB.reminderTypeKey]);
    }
    return sortFunction_byDate(reminderA, reminderB);
}
export function getOrganizationRemindersWithDB(database, organizationID, requestUser) {
    const reminders = database
        .prepare(`select reminderIndex, reminderTypeKey,
        dueDate, dismissedDate,
        reminderStatus, reminderNote,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis
        from OrganizationReminders
        where recordDelete_timeMillis is null and organizationID = ?`)
        .all(organizationID);
    for (const reminder of reminders) {
        reminder.recordType = 'reminder';
        reminder.dueDateString = dateTimeFns.dateIntegerToString(reminder.dueDate || 0);
        reminder.dismissedDateString = dateTimeFns.dateIntegerToString(reminder.dismissedDate || 0);
        reminder.canUpdate = canUpdateObject(reminder, requestUser);
    }
    switch (configFunctions.getProperty('reminders.preferredSortOrder')) {
        case 'date': {
            reminders.sort(sortFunction_byDate);
            break;
        }
        case 'config': {
            reminders.sort(sortFunction_byConfig);
            break;
        }
    }
    return reminders;
}
export default function getOrganizationReminders(organizationID, requestUser) {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const reminders = getOrganizationRemindersWithDB(database, organizationID, requestUser);
    database.close();
    return reminders;
}
