import type sqlite from 'better-sqlite3'

export function getMaxOrganizationRemarkIndexWithDB(
  database: sqlite.Database,
  organizationID: number
): number {
  const result = database
    .prepare(
      `select remarkIndex
        from OrganizationRemarks
        where organizationID = ?
        order by remarkIndex desc
        limit 1`
    )
    .get(organizationID) as
    | {
        remarkIndex: number
      }
    | undefined

  return result === undefined ? -1 : result.remarkIndex
}
