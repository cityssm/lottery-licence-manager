import { runSQL_hasChanges } from './_runSQL.js';
export function deleteOrganization(organizationID, requestUser) {
    return runSQL_hasChanges(`update Organizations
      set recordDelete_userName = ?, recordDelete_timeMillis = ?
      where organizationID = ? and recordDelete_timeMillis is null`, [requestUser.userName, Date.now(), organizationID]);
}
