import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'
import sqlite from 'better-sqlite3'

import { licencesDB as databasePath } from '../../data/databasePaths.js'
import type { LotteryEvent, User } from '../../types/recordTypes.js'
import * as configFunctions from '../functions.config.js'
import { canUpdateObject } from '../licencesDB.js'

export default function getOutstandingEvents(
  requestBody: {
    eventDateType?: string
    licenceTypeKey?: string
  },
  requestUser: User
): LotteryEvent[] {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const sqlParameters: unknown[] = []

  let sql = `select o.organizationID, o.organizationName,
      e.eventDate, e.reportDate,
      l.licenceTypeKey, l.licenceID, l.externalLicenceNumber,
      e.bank_name, e.bank_address, e.bank_accountNumber, e.bank_accountBalance,
      sum(c.costs_receipts) as costs_receiptsSum,
      e.recordUpdate_userName, e.recordUpdate_timeMillis
      from LotteryEvents e
      left join LotteryLicences l on e.licenceID = l.licenceID
      left join Organizations o on l.organizationID = o.organizationID
      left join LotteryEventCosts c on e.licenceID = c.licenceID and e.eventDate = c.eventDate
      where e.recordDelete_timeMillis is null
      and l.recordDelete_timeMillis is null
      and (e.reportDate is null or e.reportDate = 0)`

  if (requestBody.licenceTypeKey && requestBody.licenceTypeKey !== '') {
    sql += ' and l.licenceTypeKey = ?'
    sqlParameters.push(requestBody.licenceTypeKey)
  }

  if (requestBody.eventDateType) {
    const currentDate = dateTimeFns.dateToInteger(new Date())

    if (requestBody.eventDateType === 'past') {
      sql += ' and e.eventDate < ?'
      sqlParameters.push(currentDate)
    } else if (requestBody.eventDateType === 'upcoming') {
      sql += ' and e.eventDate >= ?'
      sqlParameters.push(currentDate)
    }
  }

  sql += ` group by o.organizationID, o.organizationName,
      e.eventDate, e.reportDate,
      l.licenceTypeKey, l.licenceID, l.externalLicenceNumber,
      e.bank_name, e.bank_address, e.bank_accountNumber, e.bank_accountBalance,
      e.recordUpdate_userName, e.recordUpdate_timeMillis
      order by o.organizationName, o.organizationID, e.eventDate, l.licenceID`

  const events = database.prepare(sql).all(sqlParameters) as LotteryEvent[]

  database.close()

  for (const lotteryEvent of events) {
    lotteryEvent.recordType = 'event'

    lotteryEvent.eventDateString = dateTimeFns.dateIntegerToString(
      lotteryEvent.eventDate
    )
    lotteryEvent.reportDateString = dateTimeFns.dateIntegerToString(
      lotteryEvent.reportDate
    )

    lotteryEvent.licenceType =
      (configFunctions.getLicenceType(lotteryEvent.licenceTypeKey) || {})
        .licenceType || ''

    lotteryEvent.bank_name_isOutstanding = (lotteryEvent.bank_name ?? '') === ''

    lotteryEvent.canUpdate = canUpdateObject(lotteryEvent, requestUser)
  }

  return events
}
