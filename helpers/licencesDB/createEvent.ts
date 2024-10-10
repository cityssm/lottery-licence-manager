import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'
import type * as sqlite from 'better-sqlite3'

import type { User } from '../../types/recordTypes.js'

export function createEventWithDB(
  database: sqlite.Database,
  licenceID: string | number,
  eventDateString: string,
  requestUser: User
): void {
  const nowMillis = Date.now()

  database
    .prepare(
      `insert or ignore into LotteryEvents (
        licenceID, eventDate,
        recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?)`
    )
    .run(
      licenceID,
      dateTimeFns.dateStringToInteger(eventDateString),
      requestUser.userName,
      nowMillis,
      requestUser.userName,
      nowMillis
    )
}
