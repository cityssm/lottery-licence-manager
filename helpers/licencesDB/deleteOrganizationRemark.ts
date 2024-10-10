import type { User } from '../../types/recordTypes.js'

import { runSQL_hasChanges } from './_runSQL.js'

export default function deleteOrganizationRemark(
  organizationID: number | string,
  remarkIndex: number | string,
  requestUser: User
): boolean {
  return runSQL_hasChanges(
    `update OrganizationRemarks
      set recordDelete_userName = ?, recordDelete_timeMillis = ?
      where organizationID = ? and remarkIndex = ? and recordDelete_timeMillis is null`,
    [requestUser.userName, Date.now(), organizationID, remarkIndex]
  )
}
