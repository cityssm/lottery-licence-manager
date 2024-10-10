import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js';
import { runSQL_hasChanges } from './_runSQL.js';
export default function updateOrganizationReminder(requestBody, requestUser) {
    return runSQL_hasChanges(`update OrganizationReminders
      set reminderTypeKey = ?,
      dueDate = ?,
      reminderStatus = ?,
      reminderNote = ?,
      dismissedDate = ?,
      recordUpdate_userName = ?,
      recordUpdate_timeMillis = ?
      where organizationID = ?
      and reminderIndex = ?
      and recordDelete_timeMillis is null`, [
        requestBody.reminderTypeKey,
        requestBody.dueDateString === ''
            ? undefined
            : dateTimeFns.dateStringToInteger(requestBody.dueDateString),
        requestBody.reminderStatus,
        requestBody.reminderNote,
        requestBody.dismissedDateString === ''
            ? undefined
            : dateTimeFns.dateStringToInteger(requestBody.dismissedDateString),
        requestUser.userName,
        Date.now(),
        requestBody.organizationID,
        requestBody.reminderIndex
    ]);
}
