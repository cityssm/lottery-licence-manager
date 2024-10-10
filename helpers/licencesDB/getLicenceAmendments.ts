import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'
import type sqlite from 'better-sqlite3'

import type { LotteryLicenceAmendment } from '../../types/recordTypes.js'

export function getLicenceAmendmentsWithDB(
  database: sqlite.Database,
  licenceID: number | string
): LotteryLicenceAmendment[] {
  const amendments = database
    .prepare(
      `select *
        from LotteryLicenceAmendments
        where licenceID = ?
        and recordDelete_timeMillis is null
        order by amendmentDate, amendmentTime, amendmentIndex`
    )
    .all(licenceID) as LotteryLicenceAmendment[]

  for (const amendmentObject of amendments) {
    amendmentObject.amendmentDateString = dateTimeFns.dateIntegerToString(
      amendmentObject.amendmentDate
    )
    amendmentObject.amendmentTimeString = dateTimeFns.timeIntegerToString(
      amendmentObject.amendmentTime
    )
  }

  return amendments
}
