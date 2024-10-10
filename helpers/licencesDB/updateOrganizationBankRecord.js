import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js';
import { runSQL_hasChanges } from './_runSQL.js';
export default function updateOrganizationBankRecord(requestBody, requestUser) {
    return runSQL_hasChanges(`update OrganizationBankRecords
      set recordDate = ?,
      recordIsNA = ?,
      recordNote = ?,
      recordUpdate_userName = ?,
      recordUpdate_timeMillis = ?
      where organizationID = ?
      and recordIndex = ?
      and recordDelete_timeMillis is null`, [
        requestBody.recordDateString === ''
            ? undefined
            : dateTimeFns.dateStringToInteger(requestBody.recordDateString),
        requestBody.recordIsNA ? 1 : 0,
        requestBody.recordNote,
        requestUser.userName,
        Date.now(),
        requestBody.organizationID,
        requestBody.recordIndex
    ]);
}
