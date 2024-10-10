import type sqlite from 'better-sqlite3'

export function getMaxTransactionIndexWithDB(
  database: sqlite.Database,
  licenceID: number | string
): number {
  const result = database
    .prepare(
      `select transactionIndex
        from LotteryLicenceTransactions
        where licenceID = ?
        order by transactionIndex desc
        limit 1`
    )
    .get(licenceID) as
    | {
        transactionIndex: number
      }
    | undefined

  return result === undefined ? -1 : result.transactionIndex
}
