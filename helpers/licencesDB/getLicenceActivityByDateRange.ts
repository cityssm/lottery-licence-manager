import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'
import sqlite from 'better-sqlite3'

import { licencesDB as databasePath } from '../../data/databasePaths.js'
import type { LotteryEvent, LotteryLicence } from '../../types/recordTypes.js'

export interface GetLicenceActivityByDateRangeReturn {
  startDateString: string
  endDateString: string
  licences: LotteryLicence[]
  events: LotteryEvent[]
}

export default function getLicenceActivityByDateRange(
  startDate: number,
  endDate: number
): GetLicenceActivityByDateRangeReturn {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const activity: GetLicenceActivityByDateRangeReturn = {
    startDateString: dateTimeFns.dateIntegerToString(startDate),
    endDateString: dateTimeFns.dateIntegerToString(endDate),
    licences: [],
    events: []
  }

  // Get licences
  activity.licences = database
    .prepare(
      `select l.licenceID, l.externalLicenceNumber,
        l.startDate, l.endDate,
        l.licenceTypeKey, l.licenceDetails,
        o.organizationName, lo.locationName, lo.locationAddress1
        from LotteryLicences l
        left join Organizations o on l.organizationID = o.organizationID
        left join Locations lo on l.locationID = lo.locationID
        where l.recordDelete_timeMillis is null
        and (? between l.startDate and l.endDate
          or ? between l.startDate and l.endDate
          or l.startDate between ? and ?
          or l.endDate between ? and ?)
        order by l.endDate, l.startDate`
    )
    .all(
      startDate,
      endDate,
      startDate,
      endDate,
      startDate,
      endDate
    ) as LotteryLicence[]

  for (const record of activity.licences) {
    record.startDateString = dateTimeFns.dateIntegerToString(record.startDate)
    record.endDateString = dateTimeFns.dateIntegerToString(record.endDate)
  }

  // Get events
  activity.events = database
    .prepare(
      `select e.eventDate, l.licenceID, l.externalLicenceNumber,
        l.startTime, l.endTime, l.licenceTypeKey, l.licenceDetails,
        o.organizationName, lo.locationName, lo.locationAddress1
        from LotteryEvents e
        left join LotteryLicences l on e.licenceId = l.licenceID
        left join Organizations o on l.organizationID = o.organizationID
        left join Locations lo on l.locationID = lo.locationID
        where l.recordDelete_timeMillis is null
        and e.recordDelete_timeMillis is null
        and e.eventDate between ? and ?
        order by l.startTime, l.endTime`
    )
    .all(startDate, endDate) as LotteryEvent[]

  for (const record of activity.events) {
    record.eventDateString = dateTimeFns.dateIntegerToString(record.eventDate)
    record.startTimeString = dateTimeFns.timeIntegerToString(record.startTime)
    record.endTimeString = dateTimeFns.timeIntegerToString(record.endTime)
  }

  database.close()

  return activity
}
