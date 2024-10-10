import sqlite from 'better-sqlite3'
import type * as expressSession from 'express-session'

import { licencesDB as databasePath } from '../../data/databasePaths.js'

import { addLicenceAmendmentWithDB } from './addLicenceAmendment.js'
import { getLicenceWithDB } from './getLicence.js'

export default function voidTransaction(
  licenceID: number | string,
  transactionIndex: number | string,
  requestSession: expressSession.Session
): boolean {
  const database = sqlite(databasePath)

  const licenceObject = getLicenceWithDB(database, licenceID, requestSession, {
    includeTicketTypes: false,
    includeFields: false,
    includeEvents: false,
    includeAmendments: false,
    includeTransactions: false
  })

  const nowMillis = Date.now()

  const hasChanges =
    database
      .prepare(
        `update LotteryLicenceTransactions
          set recordDelete_userName = ?,
            recordDelete_timeMillis = ?
          where licenceID = ?
            and transactionIndex = ?
            and recordDelete_timeMillis is null`
      )
      .run(requestSession.user.userName, nowMillis, licenceID, transactionIndex)
      .changes > 0

  if (hasChanges && licenceObject.trackUpdatesAsAmendments) {
    addLicenceAmendmentWithDB(
      database,
      licenceID,
      'Transaction Voided',
      '',
      1,
      requestSession
    )
  }

  database.close()

  return hasChanges
}
