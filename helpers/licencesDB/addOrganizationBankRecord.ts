import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'
import sqlite from 'better-sqlite3'

import { licencesDB as databasePath } from '../../data/databasePaths.js'
import type { OrganizationBankRecord, User } from '../../types/recordTypes.js'

import { getMaxOrganizationBankRecordIndexWithDB } from './getMaxOrganizationBankRecordIndex.js'

export default function addOrganizationBankRecord(
  requestBody: OrganizationBankRecord,
  requestUser: User
): boolean {
  // Check for a record with the same unique key

  const database = sqlite(databasePath)

  const record = database
    .prepare(
      `select recordIndex, recordDelete_timeMillis
        from OrganizationBankRecords
        where organizationID = ? and accountNumber = ?
        and bankingYear = ? and bankingMonth = ?
        and bankRecordType = ?`
    )
    .get(
      requestBody.organizationID,
      requestBody.accountNumber,
      requestBody.bankingYear,
      requestBody.bankingMonth,
      requestBody.bankRecordType
    )

  if (record) {
    if (record.recordDelete_timeMillis) {
      const info = database
        .prepare(
          `delete from OrganizationBankRecords
            where organizationID = ? and recordIndex = ?`
        )
        .run(requestBody.organizationID, record.recordIndex)

      if (info.changes === 0) {
        // Record not deleted
        database.close()
        return false
      }
    } else {
      // An active record already exists
      database.close()
      return false
    }
  }

  // Get next recordIndex
  const newRecordIndex =
    getMaxOrganizationBankRecordIndexWithDB(
      database,
      requestBody.organizationID
    ) + 1

  // Insert the record
  const nowMillis = Date.now()

  const info = database
    .prepare(
      `insert into OrganizationBankRecords (
        organizationID, recordIndex, accountNumber,
        bankingYear, bankingMonth, bankRecordType, recordIsNA, recordDate, recordNote,
        recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      requestBody.organizationID,
      newRecordIndex,
      requestBody.accountNumber,
      requestBody.bankingYear,
      requestBody.bankingMonth,
      requestBody.bankRecordType,
      requestBody.recordIsNA ? 1 : 0,
      dateTimeFns.dateStringToInteger(requestBody.recordDateString),
      requestBody.recordNote,
      requestUser.userName,
      nowMillis,
      requestUser.userName,
      nowMillis
    )

  database.close()

  return info.changes > 0
}
