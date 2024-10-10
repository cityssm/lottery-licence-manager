import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'
import sqlite from 'better-sqlite3'

import { licencesDB as databasePath } from '../../data/databasePaths.js'

interface LotteryLicenceTicketTypeSummary {
  ticketType: string
  distributorLocationID: number
  distributorLocationDisplayName: string
  manufacturerLocationID: number
  manufacturerLocationDisplayName: string
  unitCountSum: number
  licenceFeeSum: number
}

export default function getLicenceTicketTypeSummary(
  licenceID: number | string
): LotteryLicenceTicketTypeSummary[] {
  const database = sqlite(databasePath, {
    readonly: true
  })

  database.function(
    'userFn_dateIntegerToString',
    dateTimeFns.dateIntegerToString
  )

  const ticketTypeSummary = database
    .prepare(
      `select t.ticketType,
        t.distributorLocationID,
        iif(d.locationName = '', d.locationAddress1, d.locationName) as distributorLocationDisplayName,
        t.manufacturerLocationID,
        iif(m.locationName = '', m.locationAddress1, m.locationName) as manufacturerLocationDisplayName,
        sum(t.unitCount) as unitCountSum,
        sum(t.licenceFee) as licenceFeeSum
        from LotteryLicenceTicketTypes t
        left join Locations d on t.distributorLocationID = d.locationID
        left join Locations m on t.manufacturerLocationID = m.locationID
        where t.licenceID = ? and t.recordDelete_timeMillis is null
        group by t.ticketType, d.locationID, m.locationID
        order by t.ticketType, distributorLocationDisplayName, manufacturerLocationDisplayName`
    )
    .all(licenceID) as LotteryLicenceTicketTypeSummary[]

  database.close()

  return ticketTypeSummary
}
