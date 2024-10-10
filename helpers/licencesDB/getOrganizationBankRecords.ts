import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'
import sqlite from 'better-sqlite3'

import { licencesDB as databasePath } from '../../data/databasePaths.js'
import type { OrganizationBankRecord } from '../../types/recordTypes'

export default function getOrganizationBankRecords(
  organizationID: number | string,
  accountNumber: string,
  bankingYear: number | string
): OrganizationBankRecord[] {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const bankRecords = database
    .prepare(
      `select recordIndex, bankingMonth, bankRecordType,
        recordDate, recordNote, recordIsNA,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis
        from OrganizationBankRecords
        where recordDelete_timeMillis is null
        and organizationID = ? and accountNumber = ? and bankingYear = ?`
    )
    .all(organizationID, accountNumber, bankingYear) as OrganizationBankRecord[]

  database.close()

  for (const bankRecord of bankRecords) {
    bankRecord.recordDateString = dateTimeFns.dateIntegerToString(
      bankRecord.recordDate
    )
  }

  return bankRecords
}
