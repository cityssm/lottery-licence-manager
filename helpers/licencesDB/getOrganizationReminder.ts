import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'
import sqlite from 'better-sqlite3'

import { licencesDB as databasePath } from '../../data/databasePaths.js'
import type { OrganizationReminder, User } from '../../types/recordTypes.js'
import { canUpdateObject } from '../licencesDB.js'

export default function getOrganizationReminder(
  organizationID: number | string,
  reminderIndex: number | string,
  requestUser: User
): OrganizationReminder | undefined {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const reminder = database
    .prepare(
      `select * from OrganizationReminders
        where recordDelete_timeMillis is null
        and organizationID = ? and reminderIndex = ?`
    )
    .get(organizationID, reminderIndex) as OrganizationReminder | undefined

  database.close()

  if (reminder !== undefined) {
    reminder.recordType = 'reminder'

    reminder.dueDateString = dateTimeFns.dateIntegerToString(
      reminder.dueDate || 0
    )
    reminder.dismissedDateString = dateTimeFns.dateIntegerToString(
      reminder.dismissedDate || 0
    )

    reminder.canUpdate = canUpdateObject(reminder, requestUser)
  }

  return reminder
}
