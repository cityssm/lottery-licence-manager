import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js';
import { runSQL_hasChanges } from './_runSQL.js';
export default function dismissOrganizationReminder(organizationID, reminderIndex, requestUser) {
    const currentDate = new Date();
    return runSQL_hasChanges(`update OrganizationReminders
      set dismissedDate = ?,
      recordUpdate_userName = ?, recordUpdate_timeMillis = ?
      where organizationID = ?
      and reminderIndex = ?
      and dismissedDate is null
      and recordDelete_timeMillis is null`, [
        dateTimeFns.dateToInteger(currentDate),
        requestUser.userName,
        currentDate.getTime(),
        organizationID,
        reminderIndex
    ]);
}
