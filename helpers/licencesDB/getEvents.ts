import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'
import sqlite from 'better-sqlite3'
import type * as expressSession from 'express-session'

import { licencesDB as databasePath } from '../../data/databasePaths.js'
import type * as llm from '../../types/recordTypes'
import { canUpdateObject } from '../licencesDB.js'

export interface GetEventsFilters {
  externalLicenceNumber?: string
  licenceTypeKey?: string
  organizationName?: string
  locationName?: string
  eventYear?: string
}

interface GetEventsReturn {
  count: number
  events: llm.LotteryEvent[]
}

export default function getEvents(
  requestBody: GetEventsFilters,
  requestSession: expressSession.Session,
  options: {
    limit: number
    offset: number
  }
): GetEventsReturn {
  const database = sqlite(databasePath, {
    readonly: true
  })

  // build where clause
  const sqlParameters = []

  let sqlWhereClause = ` where e.recordDelete_timeMillis is null
    and l.recordDelete_timeMillis is null`

  if (requestBody.eventYear && requestBody.eventYear !== '') {
    sqlWhereClause += ` and e.eventDate > (? * 10000)
      and e.eventDate < (? * 10000) + 9999`

    sqlParameters.push(requestBody.eventYear, requestBody.eventYear)
  }

  if (
    requestBody.externalLicenceNumber &&
    requestBody.externalLicenceNumber !== ''
  ) {
    sqlWhereClause += ' and instr(lower(l.externalLicenceNumber), ?) > 0'
    sqlParameters.push(requestBody.externalLicenceNumber)
  }

  if (requestBody.licenceTypeKey && requestBody.licenceTypeKey !== '') {
    sqlWhereClause += ' and l.licenceTypeKey = ?'
    sqlParameters.push(requestBody.licenceTypeKey)
  }

  if (requestBody.organizationName && requestBody.organizationName !== '') {
    const organizationNamePieces = requestBody.organizationName
      .toLowerCase()
      .split(' ')

    for (const organizationNamePiece of organizationNamePieces) {
      sqlWhereClause += ' and instr(lower(o.organizationName), ?)'
      sqlParameters.push(organizationNamePiece)
    }
  }

  if (requestBody.locationName && requestBody.locationName !== '') {
    const locationNamePieces = requestBody.locationName.toLowerCase().split(' ')

    for (const locationNamePiece of locationNamePieces) {
      sqlWhereClause +=
        ' and (instr(lower(lo.locationName), ?) or instr(lower(lo.locationAddress1), ?))'

      sqlParameters.push(locationNamePiece, locationNamePiece)
    }
  }

  // if a limit is used, get the count
  let count = 0

  if (options.limit !== -1) {
    count = database
      .prepare(
        `select ifnull(count(*), 0)
          from LotteryEvents e
          left join LotteryLicences l on e.licenceID = l.licenceID
          left join Locations lo on l.locationID = lo.locationID
          left join Organizations o on l.organizationID = o.organizationID
          ${sqlWhereClause}`
      )
      .pluck()
      .get(sqlParameters) as number
  }

  let sql =
    `select
        'event' as recordType,
        e.eventDate, userFn_dateIntegerToString(e.eventDate) as eventDateString,
        e.reportDate, e.bank_name,
        sum(coalesce(c.costs_receipts, 0)) as costs_receiptsSum,
        l.licenceID, l.externalLicenceNumber, l.licenceTypeKey, l.licenceDetails,
        iif(lo.locationName = '', lo.locationAddress1, lo.locationName) as locationDisplayName,
        l.startTime, userFn_timeIntegerToString(l.startTime) as startTimeString,
        l.endTime, userFn_timeIntegerToString(l.endTime) as endTimeString,
        o.organizationName,
        e.recordCreate_userName, e.recordCreate_timeMillis,
        e.recordUpdate_userName, e.recordUpdate_timeMillis
      from LotteryEvents e
      left join LotteryLicences l on e.licenceID = l.licenceID
      left join Locations lo on l.locationID = lo.locationID
      left join Organizations o on l.organizationID = o.organizationID
      left join LotteryEventCosts c on e.licenceID = c.licenceID and e.eventDate = c.eventDate
      ${sqlWhereClause}
      group by e.eventDate, e.reportDate, e.bank_name,
        l.licenceID, l.externalLicenceNumber, l.licenceTypeKey, l.licenceDetails,
        lo.locationName, lo.locationAddress1,
        l.startTime, l.endTime,
        o.organizationName,
        e.recordCreate_userName, e.recordCreate_timeMillis, e.recordUpdate_userName, e.recordUpdate_timeMillis
      order by e.eventDate, l.startTime`

  if (options.limit !== -1) {
    sql +=
      ` limit ${options.limit.toString()} offset ${(options.offset || 0).toString()}`
  }

  database.function(
    'userFn_dateIntegerToString',
    dateTimeFns.dateIntegerToString
  )
  database.function(
    'userFn_timeIntegerToString',
    dateTimeFns.timeIntegerToString
  )

  const events = database.prepare(sql).all(sqlParameters) as llm.LotteryEvent[]

  database.close()

  for (const lotteryEvent of events) {
    lotteryEvent.canUpdate = canUpdateObject(lotteryEvent, requestSession)

    delete lotteryEvent.bank_name
  }

  return {
    count: options.limit === -1 ? events.length : count,
    events
  }
}
