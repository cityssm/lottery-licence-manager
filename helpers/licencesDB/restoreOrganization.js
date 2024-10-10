import { runSQL_hasChanges } from './_runSQL.js';
export default function restoreOrganization(organizationID, requestUser) {
    const nowMillis = Date.now();
    return runSQL_hasChanges(`update Organizations
      set recordDelete_userName = null,
      recordDelete_timeMillis = null,
      recordUpdate_userName = ?,
      recordUpdate_timeMillis = ?
      where organizationID = ?
      and recordDelete_timeMillis is not null`, [requestUser.userName, nowMillis, organizationID]);
}
