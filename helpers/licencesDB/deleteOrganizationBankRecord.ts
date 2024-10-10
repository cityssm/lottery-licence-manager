import type { User } from '../../types/recordTypes.js'

import { runSQL_hasChanges } from './_runSQL.js'

export default function deleteOrganizationBankRecord(
  organizationID: number | string,
  recordIndex: number | string,
  requestUser: User
): boolean {
  return runSQL_hasChanges(
    `update OrganizationBankRecords
      set recordDelete_userName = ?, recordDelete_timeMillis = ?
      where organizationID = ? and recordIndex = ? and recordDelete_timeMillis is null`,
    [requestUser.userName, Date.now(), organizationID, recordIndex]
  )
}
