import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'
import sqlite from 'better-sqlite3'

import { licencesDB as databasePath } from '../../data/databasePaths.js'
import type { OrganizationReminder, User } from '../../types/recordTypes.js'
import * as configFunctions from '../functions.config.js'
import { canUpdateObject } from '../licencesDB.js'

const reminderTypeOrdering: Record<string, number> = {}

const reminderCategories = configFunctions.getProperty('reminderCategories')

;(() => {
  let typeIndex = 0

  for (const reminderCategory of reminderCategories) {
    for (const reminderType of reminderCategory.reminderTypes) {
      typeIndex += 1
      reminderTypeOrdering[reminderType.reminderTypeKey] = typeIndex
    }
  }
})()

// eslint-disable-next-line @typescript-eslint/naming-convention
function sortFunction_byDate(
  reminderA: OrganizationReminder,
  reminderB: OrganizationReminder
): number {
  /*
   * Dismissed Date
   */

  // A is not dismissed, B is, A comes first
  if (
    reminderA.dismissedDateString === '' &&
    reminderB.dismissedDateString !== ''
  ) {
    return -1
  }

  // B is not dismissed, A is, B comes first
  if (
    reminderB.dismissedDateString === '' &&
    reminderA.dismissedDateString !== ''
  ) {
    return 1
  }

  /*
   * Due Date
   */

  // A has no reminder, B has one, B comes first
  if (reminderA.dueDateString === '' && reminderB.dueDateString !== '') {
    return 1
  }

  // B has no reminder, A has one, A comes first
  if (reminderB.dueDateString === '' && reminderA.dueDateString !== '') {
    return -1
  }

  /*
   * Dismissed Date
   */

  if (reminderA.dismissedDate !== reminderB.dismissedDate) {
    return reminderB.dueDate - reminderA.dismissedDate
  }

  /*
   * Config File Ordering
   */

  return (
    reminderTypeOrdering[reminderA.reminderTypeKey] -
    reminderTypeOrdering[reminderB.reminderTypeKey]
  )
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function sortFunction_byConfig(
  reminderA: OrganizationReminder,
  reminderB: OrganizationReminder
): number {
  if (reminderA.reminderTypeKey !== reminderB.reminderTypeKey) {
    return (
      reminderTypeOrdering[reminderA.reminderTypeKey] -
      reminderTypeOrdering[reminderB.reminderTypeKey]
    )
  }

  return sortFunction_byDate(reminderA, reminderB)
}

export function getOrganizationRemindersWithDB(
  database: sqlite.Database,
  organizationID: number | string,
  requestUser: User
): OrganizationReminder[] {
  const reminders = database
    .prepare(
      `select reminderIndex, reminderTypeKey,
        dueDate, dismissedDate,
        reminderStatus, reminderNote,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis
        from OrganizationReminders
        where recordDelete_timeMillis is null and organizationID = ?`
    )
    .all(organizationID) as OrganizationReminder[]

  for (const reminder of reminders) {
    reminder.recordType = 'reminder'

    reminder.dueDateString = dateTimeFns.dateIntegerToString(
      reminder.dueDate || 0
    )
    reminder.dismissedDateString = dateTimeFns.dateIntegerToString(
      reminder.dismissedDate || 0
    )

    reminder.canUpdate = canUpdateObject(reminder, requestUser)
  }

  switch (configFunctions.getProperty('reminders.preferredSortOrder')) {
    case 'date': {
      reminders.sort(sortFunction_byDate)
      break
    }

    case 'config': {
      reminders.sort(sortFunction_byConfig)
      break
    }
  }

  return reminders
}

export default function getOrganizationReminders(
  organizationID: number | string,
  requestUser: User
): OrganizationReminder[] {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const reminders = getOrganizationRemindersWithDB(
    database,
    organizationID,
    requestUser
  )

  database.close()

  return reminders
}
