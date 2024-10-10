import sqlite from 'better-sqlite3'

import { licencesDB as databasePath } from '../../data/databasePaths.js'
import type { User } from '../../types/recordTypes.js'

export function deleteOrganizationReminderWithDB(
  database: sqlite.Database,
  organizationID: number | string,
  reminderIndex: number | string,
  requestUser: User
): boolean {
  const result = database
    .prepare(
      `update OrganizationReminders
        set recordDelete_userName = ?, recordDelete_timeMillis = ?
        where organizationID = ? and reminderIndex = ? and recordDelete_timeMillis is null`
    )
    .run(requestUser.userName, Date.now(), organizationID, reminderIndex)

  return result.changes > 0
}

export default function deleteOrganizationReminder(
  organizationID: number | string,
  reminderIndex: number | string,
  requestUser: User
): boolean {
  const database = sqlite(databasePath)

  const hasChanges = deleteOrganizationReminderWithDB(
    database,
    organizationID,
    reminderIndex,
    requestUser
  )

  database.close()

  return hasChanges
}
