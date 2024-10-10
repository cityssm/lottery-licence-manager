import type { User } from '../../types/recordTypes.js'

import { runSQL_hasChanges } from './_runSQL.js'

export default function updateApplicationSetting(
  settingKey: string,
  settingValue: string,
  requestUser: User
): boolean {
  return runSQL_hasChanges(
    `update ApplicationSettings
      set settingValue = ?,
      recordUpdate_userName = ?,
      recordUpdate_timeMillis = ?
      where settingKey = ?`,
    [settingValue, requestUser.userName, Date.now(), settingKey]
  )
}
