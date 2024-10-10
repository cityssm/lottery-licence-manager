import type sqlite from 'better-sqlite3'

export function getMaxOrganizationBankRecordIndexWithDB(
  database: sqlite.Database,
  organizationID: number | string
): number {
  const result = database
    .prepare(
      'select recordIndex' +
        ' from OrganizationBankRecords' +
        ' where organizationID = ?' +
        ' order by recordIndex desc' +
        ' limit 1'
    )
    .get(organizationID) as
    | {
        recordIndex: number
      }
    | undefined

  return result === undefined ? -1 : result.recordIndex
}
