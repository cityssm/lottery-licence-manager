import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'
import sqlite from 'better-sqlite3'

import { licencesDB as databasePath } from '../../data/databasePaths.js'
import type { OrganizationReminder, User } from '../../types/recordTypes'

import { getMaxOrganizationReminderIndexWithDB } from './getMaxOrganizationReminderIndex.js'

export interface ReminderData {
  organizationID: string
  reminderTypeKey: string
  dueDateString?: string
  reminderStatus: string
  reminderNote: string
}

export function addOrganizationReminderWithDB(
  database: sqlite.Database,
  reminderData: ReminderData,
  requestUser: User
): OrganizationReminder {
  const newReminderIndex =
    getMaxOrganizationReminderIndexWithDB(
      database,
      reminderData.organizationID
    ) + 1

  const nowMillis = Date.now()

  database
    .prepare(
      `insert into OrganizationReminders (
        organizationID, reminderIndex, reminderTypeKey, dueDate, reminderStatus, reminderNote,
        recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      reminderData.organizationID,
      newReminderIndex,
      reminderData.reminderTypeKey,
      !reminderData.dueDateString || reminderData.dueDateString === ''
        ? undefined
        : dateTimeFns.dateStringToInteger(reminderData.dueDateString),
      reminderData.reminderStatus,
      reminderData.reminderNote,
      requestUser.userName,
      nowMillis,
      requestUser.userName,
      nowMillis
    )

  const reminder: OrganizationReminder = {
    recordType: 'reminder',
    canUpdate: true,
    organizationID: Number.parseInt(reminderData.organizationID, 10),
    reminderIndex: newReminderIndex,
    reminderTypeKey: reminderData.reminderTypeKey,
    dueDate: dateTimeFns.dateStringToInteger(reminderData.dueDateString),
    dueDateString: reminderData.dueDateString,
    dismissedDate: undefined,
    dismissedDateString: '',
    reminderStatus: reminderData.reminderStatus,
    reminderNote: reminderData.reminderNote,
    recordCreate_userName: requestUser.userName,
    recordCreate_timeMillis: nowMillis,
    recordUpdate_userName: requestUser.userName,
    recordUpdate_timeMillis: nowMillis
  }

  return reminder
}

export default function addOrganizationReminder(
  requestBody: ReminderData,
  requestUser: User
): OrganizationReminder {
  const database = sqlite(databasePath)

  const reminder = addOrganizationReminderWithDB(
    database,
    requestBody,
    requestUser
  )

  database.close()

  return reminder
}
