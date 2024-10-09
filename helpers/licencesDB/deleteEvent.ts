import type * as expressSession from 'express-session'

import * as licencesDB from '../licencesDB.js'

import { runSQL } from './_runSQL.js'

export default function deleteEvent(
  licenceID: number | string,
  eventDate: number | string,
  requestSession: expressSession.Session
): boolean {
  const nowMillis = Date.now()

  const result = runSQL(
    `update LotteryEvents
      set recordDelete_userName = ?,
      recordDelete_timeMillis = ?
      where licenceID = ?
      and eventDate = ?
      and recordDelete_timeMillis is null`,
    [requestSession.user.userName, nowMillis, licenceID, eventDate]
  )

  const changeCount = result === undefined ? 0 : result.changes

  // Purge cached stats
  licencesDB.resetEventTableStats()

  return changeCount > 0
}
