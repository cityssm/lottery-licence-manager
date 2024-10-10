import sqlite from 'better-sqlite3'

import { licencesDB as databasePath } from '../../data/databasePaths.js'

interface GetOrganizationBankRecordStatsReturn {
  accountNumber: string
  bankingYearMin: number
  bankingYearMax: number
}

export default function getOrganizationBankRecordStats(
  organizationID: number | string
): GetOrganizationBankRecordStatsReturn[] {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const rows = database
    .prepare(
      `select accountNumber,
        min(bankingYear) as bankingYearMin,
        max(bankingYear) as bankingYearMax
        from OrganizationBankRecords
        where recordDelete_timeMillis is null
        and organizationID = ?
        group by accountNumber
        order by bankingYearMax desc, accountNumber`
    )

    .all(organizationID) as GetOrganizationBankRecordStatsReturn[]

  database.close()

  return rows
}
