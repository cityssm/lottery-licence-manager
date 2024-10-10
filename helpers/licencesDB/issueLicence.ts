import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'

import type { User } from '../../types/recordTypes.js'

import { runSQL_hasChanges } from './_runSQL.js'

export default function issueLicence(
  licenceID: number | string,
  requestUser: User
): boolean {
  const nowDate = new Date()

  const issueDate = dateTimeFns.dateToInteger(nowDate)
  const issueTime = dateTimeFns.dateToTimeInteger(nowDate)

  return runSQL_hasChanges(
    `update LotteryLicences
      set issueDate = ?,
        issueTime = ?,
        trackUpdatesAsAmendments = 1,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      where licenceID = ?
        and recordDelete_timeMillis is null
        and issueDate is null`,
    [
      issueDate,
      issueTime,
      requestUser.userName,
      nowDate.getTime(),
      licenceID
    ]
  )
}
