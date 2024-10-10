import type { User } from '../../types/recordTypes.js'

import { runSQL_hasChanges } from './_runSQL.js'

export default function pokeLicence(
  licenceID: number,
  requestUser: User
): boolean {
  return runSQL_hasChanges(
    `update LotteryLicences
      set recordUpdate_userName = ?,
      recordUpdate_timeMillis = ?
      where licenceID = ?
      and recordDelete_timeMillis is null`,
    [requestUser.userName, Date.now(), licenceID]
  )
}
