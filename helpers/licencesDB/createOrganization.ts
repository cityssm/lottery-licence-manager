import sqlite from 'better-sqlite3'

import { licencesDB as databasePath } from '../../data/databasePaths.js'
import type { Organization, User } from '../../types/recordTypes.js'

export default function createOrganization(
  requestBody: Organization,
  requestUser: User
): number {
  const database = sqlite(databasePath)

  const nowMillis = Date.now()

  const info = database
    .prepare(
      `insert into Organizations (
        organizationName, organizationAddress1, organizationAddress2,
        organizationCity, organizationProvince, organizationPostalCode, organizationNote,
        recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      requestBody.organizationName,
      requestBody.organizationAddress1,
      requestBody.organizationAddress2,
      requestBody.organizationCity,
      requestBody.organizationProvince,
      requestBody.organizationPostalCode,
      '',
      requestUser.userName,
      nowMillis,
      requestUser.userName,
      nowMillis
    )

  database.close()

  return Number(info.lastInsertRowid)
}
