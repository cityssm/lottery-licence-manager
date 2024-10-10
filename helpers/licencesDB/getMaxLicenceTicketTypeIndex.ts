import type sqlite from 'better-sqlite3'

export function getMaxLicenceTicketTypeIndexWithDB(
  database: sqlite.Database,
  licenceID: number | string
): number {
  const result = database
    .prepare(
      'select ticketTypeIndex' +
        ' from LotteryLicenceTicketTypes' +
        ' where licenceID = ?' +
        ' order by ticketTypeIndex desc' +
        ' limit 1'
    )
    .get(licenceID) as
    | {
        ticketTypeIndex: number
      }
    | undefined

  return result === undefined ? -1 : result.ticketTypeIndex
}
