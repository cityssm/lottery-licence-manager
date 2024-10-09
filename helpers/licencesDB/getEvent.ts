import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'
import sqlite from 'better-sqlite3'
import type * as expressSession from 'express-session'

import { licencesDB as databasePath } from '../../data/databasePaths.js'
import type * as llm from '../../types/recordTypes.js'
import { canUpdateObject } from '../licencesDB.js'

export function getEvent(
  licenceID: number,
  eventDate: number,
  requestSession: expressSession.Session
): llm.LotteryEvent | undefined {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const eventObject = database
    .prepare(
      `select *
        from LotteryEvents
        where recordDelete_timeMillis is null
        and licenceID = ?
        and eventDate = ?`
    )
    .get(licenceID, eventDate) as llm.LotteryEvent | undefined

  if (eventObject !== undefined) {
    eventObject.recordType = 'event'

    eventObject.eventDateString = dateTimeFns.dateIntegerToString(
      eventObject.eventDate
    )

    eventObject.reportDateString = dateTimeFns.dateIntegerToString(
      eventObject.reportDate
    )

    eventObject.startTimeString = dateTimeFns.timeIntegerToString(
      eventObject.startTime || 0
    )
    eventObject.endTimeString = dateTimeFns.timeIntegerToString(
      eventObject.endTime || 0
    )

    eventObject.canUpdate = canUpdateObject(eventObject, requestSession)

    const fieldRows = database
      .prepare(
        'select fieldKey, fieldValue' +
          ' from LotteryEventFields' +
          ' where licenceID = ? and eventDate = ?'
      )
      .all(licenceID, eventDate) as llm.FieldData[] | undefined

    eventObject.eventFields = fieldRows ?? []

    let costRows = database
      .prepare(
        'select distinct t.ticketType,' +
          ' c.costs_receipts, c.costs_admin, c.costs_prizesAwarded' +
          ' from LotteryLicenceTicketTypes t' +
          ' left join LotteryEventCosts c on t.licenceID = c.licenceID and t.ticketType = c.ticketType and c.eventDate = ?' +
          ' where t.licenceID = ?' +
          ' and (t.recordDelete_timeMillis is null or c.ticketType is not null)' +
          ' order by t.ticketType'
      )
      .all(eventDate, licenceID) as llm.LotteryEventCosts[] | undefined

    eventObject.eventCosts = costRows ?? []

    if (eventObject.eventCosts.length === 0) {
      costRows = database
        .prepare(
          'select c.ticketType,' +
            ' c.costs_receipts, c.costs_admin, c.costs_prizesAwarded' +
            ' from LotteryEventCosts c' +
            ' where c.licenceID = ?' +
            ' and c.eventDate = ?' +
            ' order by c.ticketType'
        )
        .all(licenceID, eventDate) as llm.LotteryEventCosts[] | undefined

      eventObject.eventCosts = costRows ?? []
    }

    if (eventObject.eventCosts.length === 0) {
      eventObject.eventCosts.push({
        ticketType: undefined,
        costs_receipts: undefined,
        costs_admin: undefined,
        costs_prizesAwarded: undefined
      })
    }
  }

  database.close()

  return eventObject
}

export default getEvent
