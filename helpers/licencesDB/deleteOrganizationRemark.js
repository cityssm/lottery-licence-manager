import { runSQL_hasChanges } from './_runSQL.js';
export default function deleteOrganizationRemark(organizationID, remarkIndex, requestUser) {
    return runSQL_hasChanges(`update OrganizationRemarks
      set recordDelete_userName = ?, recordDelete_timeMillis = ?
      where organizationID = ? and remarkIndex = ? and recordDelete_timeMillis is null`, [requestUser.userName, Date.now(), organizationID, remarkIndex]);
}
