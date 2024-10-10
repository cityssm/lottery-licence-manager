import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'
import sqlite from 'better-sqlite3'

import { licencesDB as databasePath } from '../../data/databasePaths.js'
import type { User } from '../../types/recordTypes.js'
import * as configFunctions from '../functions.config.js'

import { addOrganizationReminderWithDB } from './addOrganizationReminder.js'
import { deleteOrganizationReminderWithDB } from './deleteOrganizationReminder.js'
import { getOrganizationRemindersWithDB } from './getOrganizationReminders.js'

interface RollForwardOrganizationReturn {
  success: boolean
  message?: string
}

export default function rollForwardOrganization(
  organizationID: number,
  updateFiscalYear: boolean,
  updateReminders: boolean,
  requestUser: User
): RollForwardOrganizationReturn {
  const rightNowMillis = Date.now()

  const database = sqlite(databasePath)

  const organizationRow = database
    .prepare(
      `select fiscalStartDate, fiscalEndDate
        from Organizations
        where organizationID = ? and recordDelete_timeMillis is null`
    )
    .get(organizationID) as
    | { fiscalStartDate: number | null; fiscalEndDate: number | null }
    | undefined

  if (organizationRow === undefined) {
    database.close()

    return {
      success: false,
      message: 'The organization is unavailable.'
    }
  } else if (!organizationRow.fiscalStartDate) {
    database.close()

    return {
      success: false,
      message:
        'The fiscal start date is not set.  Please set it, and try again.'
    }
  } else if (!organizationRow.fiscalEndDate) {
    database.close()

    return {
      success: false,
      message: 'The fiscal end date is not set.  Please set it, and try again.'
    }
  }

  if (updateFiscalYear) {
    const newFiscalStartDate: Date = dateTimeFns.dateIntegerToDate(
      organizationRow.fiscalStartDate
    )
    newFiscalStartDate.setFullYear(newFiscalStartDate.getFullYear() + 1)

    const newFiscalEndDate: Date = dateTimeFns.dateIntegerToDate(
      organizationRow.fiscalEndDate
    )
    newFiscalEndDate.setFullYear(newFiscalEndDate.getFullYear() + 1)

    database
      .prepare(
        `update Organizations
          set fiscalStartDate = ?, fiscalEndDate = ?,
          recordUpdate_userName = ?, recordUpdate_timeMillis = ?
          where organizationID = ?`
      )
      .run(
        dateTimeFns.dateToInteger(newFiscalStartDate),
        dateTimeFns.dateToInteger(newFiscalEndDate),
        requestUser.userName,
        rightNowMillis,
        organizationID
      )
  }

  if (updateReminders) {
    // Purge reminders
    const organizationReminders = getOrganizationRemindersWithDB(
      database,
      organizationID,
      requestUser
    )

    for (const reminder of organizationReminders) {
      const reminderType = configFunctions.getReminderType(
        reminder.reminderTypeKey
      )

      if (reminderType.isBasedOnFiscalYear) {
        deleteOrganizationReminderWithDB(
          database,
          organizationID,
          reminder.reminderIndex,
          requestUser
        )
      }
    }

    // Create new reminders
    const reminderCategories = configFunctions.getProperty('reminderCategories')

    for (const reminderCategory of reminderCategories) {
      if (!reminderCategory.isActive) {
        continue
      }

      for (const reminderType of reminderCategory.reminderTypes) {
        if (reminderType.isActive && reminderType.isBasedOnFiscalYear) {
          addOrganizationReminderWithDB(
            database,
            {
              organizationID: organizationID.toString(),
              reminderTypeKey: reminderType.reminderTypeKey,
              reminderStatus: undefined,
              reminderNote: ''
            },
            requestUser
          )
        }
      }
    }
  }

  database.close()

  return {
    success: true
  }
}
