import type * as sqlite from 'better-sqlite3'

import type { User } from '../../types/recordTypes.js'

export function deleteLicenceTicketTypeWithDB(
  database: sqlite.Database,
  ticketTypeDefinition: {
    licenceID: number | string
    ticketTypeIndex: number | string
  },
  requestUser: User
): sqlite.RunResult {
  return database
    .prepare(
      `update LotteryLicenceTicketTypes
        set recordDelete_userName = ?, recordDelete_timeMillis = ?
        where licenceID = ? and ticketTypeIndex = ?`
    )
    .run(
      requestUser.userName,
      Date.now(),
      ticketTypeDefinition.licenceID,
      ticketTypeDefinition.ticketTypeIndex
    )
}
