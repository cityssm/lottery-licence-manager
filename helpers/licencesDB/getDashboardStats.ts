import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'
import sqlite from 'better-sqlite3'

import { licencesDB as databasePath } from '../../data/databasePaths.js'
import type {
  LotteryEvent,
  OrganizationReminder
} from '../../types/recordTypes'

interface LicenceStats {
  licenceCount: number
  distinctOrganizationCount: number
  distinctLocationCount: number
}

interface EventStats {
  todayCount: number
  pastCount: number
  upcomingCount: number
}

interface ReminderStats {
  todayCount: number
  pastCount: number
  upcomingCount: number
}

interface GetDashboardStatsReturn {
  currentDate: number
  currentDateString: string

  windowStartDate: number
  windowStartDateString: string

  windowEndDate: number
  windowEndDateString: string

  licenceStats: LicenceStats
  eventStats: EventStats
  events: LotteryEvent[]
  reminderStats: ReminderStats
  reminders: OrganizationReminder[]
}

export default function getDashboardStats(): GetDashboardStatsReturn {
  const windowDate = new Date()
  const currentDateInteger = dateTimeFns.dateToInteger(windowDate)

  windowDate.setDate(windowDate.getDate() + 7)
  const windowEndDateInteger = dateTimeFns.dateToInteger(windowDate)

  windowDate.setDate(windowDate.getDate() - 14)
  const windowStartDateInteger = dateTimeFns.dateToInteger(windowDate)

  const database = sqlite(databasePath, {
    readonly: true
  })

  const licenceStats = database
    .prepare(
      `select ifnull(count(licenceID), 0) as licenceCount,
        ifnull(count(distinct organizationID), 0) as distinctOrganizationCount,
        ifnull(count(distinct locationID), 0) as distinctLocationCount
        from LotteryLicences
        where recordDelete_timeMillis is NULL
        and issueDate is not NULL
        and endDate >= ?`
    )
    .get(currentDateInteger) as LicenceStats

  const eventStats = database
    .prepare(
      `select ifnull(sum(case when eventDate = ? then 1 else 0 end), 0) as todayCount,
        ifnull(sum(case when eventDate < ? then 1 else 0 end), 0) as pastCount,
        ifnull(sum(case when eventDate > ? then 1 else 0 end), 0) as upcomingCount
        from LotteryEvents
        where recordDelete_timeMillis is NULL
        and eventDate >= ?
        and eventDate <= ?`
    )
    .get(
      currentDateInteger,
      currentDateInteger,
      currentDateInteger,
      windowStartDateInteger,
      windowEndDateInteger
    ) as EventStats

  let events: LotteryEvent[] = []

  if (eventStats.todayCount > 0 || eventStats.upcomingCount > 0) {
    events = database
      .prepare(
        `select e.eventDate, l.licenceID, l.externalLicenceNumber,
          l.licenceTypeKey,
          lo.locationName, lo.locationAddress1,
          o.organizationName
          from LotteryEvents e
          left join LotteryLicences l on e.licenceID = l.licenceID
          left join Locations lo on l.locationID = lo.locationID
          left join Organizations o on l.organizationID = o.organizationID
          where e.recordDelete_timeMillis is null
          and l.recordDelete_timeMillis is null
          and e.eventDate >= ? and e.eventDate <= ?
          order by e.eventDate, l.startTime`
      )
      .all(currentDateInteger, windowEndDateInteger) as LotteryEvent[]

    for (const eventRecord of events) {
      eventRecord.eventDateString = dateTimeFns.dateIntegerToString(
        eventRecord.eventDate
      )

      eventRecord.locationDisplayName =
        eventRecord.locationName === ''
          ? eventRecord.locationAddress1
          : eventRecord.locationName
    }
  }

  const reminderStats = database
    .prepare(
      `select ifnull(sum(case when dueDate = ? then 1 else 0 end), 0) as todayCount,
        ifnull(sum(case when dueDate < ? then 1 else 0 end), 0) as pastCount,
        ifnull(sum(case when dueDate > ? then 1 else 0 end), 0) as upcomingCount
        from OrganizationReminders
        where recordDelete_timeMillis is NULL
        and dismissedDate is null
        and dueDate <= ?`
    )
    .get(
      currentDateInteger,
      currentDateInteger,
      currentDateInteger,
      windowEndDateInteger
    ) as ReminderStats

  let reminders: OrganizationReminder[] = []

  if (reminderStats.todayCount > 0 || reminderStats.upcomingCount > 0) {
    reminders = database
      .prepare(
        `select r.organizationID, o.organizationName,
          r.reminderTypeKey, r.dueDate
          from OrganizationReminders r
          left join Organizations o on r.organizationID = o.organizationID
          where r.recordDelete_timeMillis is null
          and o.recordDelete_timeMillis is null
          and r.dismissedDate is null
          and r.dueDate >= ? and r.dueDate <= ?
          order by r.dueDate, o.organizationName, r.reminderTypeKey`
      )
      .all(currentDateInteger, windowEndDateInteger) as OrganizationReminder[]

    for (const reminder of reminders) {
      reminder.dueDateString = dateTimeFns.dateIntegerToString(reminder.dueDate)
    }
  }

  database.close()

  const result: GetDashboardStatsReturn = {
    currentDate: currentDateInteger,
    currentDateString: dateTimeFns.dateIntegerToString(currentDateInteger),

    windowStartDate: windowStartDateInteger,
    windowStartDateString: dateTimeFns.dateIntegerToString(
      windowStartDateInteger
    ),

    windowEndDate: windowEndDateInteger,
    windowEndDateString: dateTimeFns.dateIntegerToString(windowEndDateInteger),

    licenceStats,
    eventStats,
    events,
    reminderStats,
    reminders
  }

  return result
}
