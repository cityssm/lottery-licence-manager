import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'
import type sqlite from 'better-sqlite3'

import type { User } from '../../types/recordTypes.js'

import { getMaxLicenceAmendmentIndexWithDB } from './getMaxLicenceAmendmentIndex.js'

export function addLicenceAmendmentWithDB(
  database: sqlite.Database,
  licenceAmendment: {
    licenceID: number | string
    amendmentType: string
    amendment: string
    isHidden: number
  },
  requestUser: User
): number {
  const newAmendmentIndex =
    getMaxLicenceAmendmentIndexWithDB(database, licenceAmendment.licenceID) + 1

  const nowDate = new Date()

  const amendmentDate = dateTimeFns.dateToInteger(nowDate)
  const amendmentTime = dateTimeFns.dateToTimeInteger(nowDate)

  database
    .prepare(
      `insert into LotteryLicenceAmendments (
        licenceID, amendmentIndex, amendmentDate, amendmentTime, amendmentType, amendment, isHidden,
        recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      licenceAmendment.licenceID,
      newAmendmentIndex,
      amendmentDate,
      amendmentTime,
      licenceAmendment.amendmentType,
      licenceAmendment.amendment,
      licenceAmendment.isHidden,
      requestUser.userName,
      nowDate.getTime(),
      requestUser.userName,
      nowDate.getTime()
    )

  return newAmendmentIndex
}
