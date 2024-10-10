import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'
import sqlite from 'better-sqlite3'

import { licencesDB as databasePath } from '../../data/databasePaths.js'
import type { LotteryEvent, LotteryLicence, LotteryLicenceTransaction, User } from '../../types/recordTypes.js'
import { canUpdateObject } from '../licencesDB.js'

import { getLicenceAmendmentsWithDB } from './getLicenceAmendments.js'
import { getLicenceTicketTypesWithDB } from './getLicenceTicketTypes.js'

export function getLicenceWithDB(
  database: sqlite.Database,
  licenceID: number | string,
  requestUser: User,
  queryOptions: {
    includeTicketTypes?: boolean
    includeFields?: boolean
    includeEvents?: boolean
    includeAmendments?: boolean
    includeTransactions?: boolean
  } = {}
): LotteryLicence | undefined {
  const licenceObject = database
    .prepare(
      `select l.*,
        lo.locationName, lo.locationAddress1
        from LotteryLicences l
        left join Locations lo on l.locationID = lo.locationID
        where l.recordDelete_timeMillis is null
        and l.licenceID = ?`
    )
    .get(licenceID) as LotteryLicence | undefined

  if (licenceObject === undefined) {
    return undefined
  }

  licenceObject.recordType = 'licence'

  licenceObject.applicationDateString = dateTimeFns.dateIntegerToString(
    licenceObject.applicationDate || 0
  )

  licenceObject.startDateString = dateTimeFns.dateIntegerToString(
    licenceObject.startDate || 0
  )
  licenceObject.endDateString = dateTimeFns.dateIntegerToString(
    licenceObject.endDate || 0
  )

  licenceObject.startTimeString = dateTimeFns.timeIntegerToString(
    licenceObject.startTime || 0
  )
  licenceObject.endTimeString = dateTimeFns.timeIntegerToString(
    licenceObject.endTime || 0
  )

  licenceObject.issueDateString = dateTimeFns.dateIntegerToString(
    licenceObject.issueDate || 0
  )
  licenceObject.issueTimeString = dateTimeFns.timeIntegerToString(
    licenceObject.issueTime || 0
  )

  licenceObject.locationDisplayName =
    licenceObject.locationName === ''
      ? licenceObject.locationAddress1
      : licenceObject.locationName

  licenceObject.canUpdate = canUpdateObject(licenceObject, requestUser)

  /*
   * Ticket types
   */

  if ('includeTicketTypes' in queryOptions && queryOptions.includeTicketTypes) {
    licenceObject.licenceTicketTypes = getLicenceTicketTypesWithDB(
      database,
      licenceID
    )
  }

  /*
   * Licence fields
   */

  if ('includeFields' in queryOptions && queryOptions.includeFields) {
    const fieldList = database
      .prepare('select * from LotteryLicenceFields where licenceID = ?')
      .all(licenceID) as llm.FieldData[]

    licenceObject.licenceFields = fieldList
  }

  /*
   * Events
   */

  if ('includeEvents' in queryOptions && queryOptions.includeEvents) {
    const eventList = database
      .prepare(
        `select eventDate,
          costs_amountDonated
          from LotteryEvents
          where licenceID = ?
          and recordDelete_timeMillis is null
          order by eventDate`
      )
      .all(licenceID) as LotteryEvent[]

    for (const eventObject of eventList) {
      eventObject.eventDateString = dateTimeFns.dateIntegerToString(
        eventObject.eventDate
      )
    }

    licenceObject.events = eventList
  }

  /*
   * Licence amendments
   */

  if ('includeAmendments' in queryOptions && queryOptions.includeAmendments) {
    licenceObject.licenceAmendments = getLicenceAmendmentsWithDB(
      database,
      licenceID
    )
  }

  /*
   * Transactions
   */

  if (
    'includeTransactions' in queryOptions &&
    queryOptions.includeTransactions
  ) {
    const transactions = database
      .prepare(
        `select * from LotteryLicenceTransactions
          where licenceID = ?
          and recordDelete_timeMillis is null
          order by transactionDate, transactionTime, transactionIndex`
      )
      .all(licenceID) as  LotteryLicenceTransaction[]

    let licenceTransactionTotal = 0

    for (const transactionObject of transactions) {
      transactionObject.transactionDateString = dateTimeFns.dateIntegerToString(
        transactionObject.transactionDate
      )
      transactionObject.transactionTimeString = dateTimeFns.timeIntegerToString(
        transactionObject.transactionTime
      )

      licenceTransactionTotal += transactionObject.transactionAmount
    }

    licenceObject.licenceTransactions = transactions
    licenceObject.licenceTransactionTotal = licenceTransactionTotal
  }

  return licenceObject
}

export default function getLicence(
  licenceID: number,
  requestUser: User
): LotteryLicence | undefined {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const licenceObject = getLicenceWithDB(database, licenceID, requestUser, {
    includeTicketTypes: true,
    includeFields: true,
    includeEvents: true,
    includeAmendments: true,
    includeTransactions: true
  })

  database.close()

  return licenceObject
}
