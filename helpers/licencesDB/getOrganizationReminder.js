import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js';
import sqlite from 'better-sqlite3';
import { licencesDB as databasePath } from '../../data/databasePaths.js';
import { canUpdateObject } from '../licencesDB.js';
export default function getOrganizationReminder(organizationID, reminderIndex, requestUser) {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const reminder = database
        .prepare(`select * from OrganizationReminders
        where recordDelete_timeMillis is null
        and organizationID = ? and reminderIndex = ?`)
        .get(organizationID, reminderIndex);
    database.close();
    if (reminder !== undefined) {
        reminder.recordType = 'reminder';
        reminder.dueDateString = dateTimeFns.dateIntegerToString(reminder.dueDate || 0);
        reminder.dismissedDateString = dateTimeFns.dateIntegerToString(reminder.dismissedDate || 0);
        reminder.canUpdate = canUpdateObject(reminder, requestUser);
    }
    return reminder;
}
