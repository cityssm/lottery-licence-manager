import type sqlite from 'better-sqlite3'

export function getMaxLicenceAmendmentIndexWithDB(
  database: sqlite.Database,
  licenceID: number | string
): number {
  const result = database
    .prepare(
      `select amendmentIndex
        from LotteryLicenceAmendments
        where licenceID = ?
        order by amendmentIndex desc
        limit 1`
    )
    .get(licenceID) as
    | {
        amendmentIndex: number
      }
    | undefined

  return result === undefined ? -1 : result.amendmentIndex
}
