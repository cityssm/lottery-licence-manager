import sqlite from 'better-sqlite3'

import { licencesDB as databasePath } from '../../data/databasePaths.js'

export default function setDefaultOrganizationRepresentative(
  organizationID: number,
  representativeIndex: number
): boolean {
  const database = sqlite(databasePath)

  database
    .prepare(
      `update OrganizationRepresentatives
        set isDefault = 0
        where organizationID = ?`
    )
    .run(organizationID)

  database
    .prepare(
      `update OrganizationRepresentatives
        set isDefault = 1
        where organizationID = ? and representativeIndex = ?`
    )
    .run(organizationID, representativeIndex)

  database.close()

  return true
}
