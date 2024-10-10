import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'
import sqlite from 'better-sqlite3'

import { licencesDB as databasePath } from '../../data/databasePaths.js'
import type { Organization } from '../../types/recordTypes'

export default function getInactiveOrganizations(
  inactiveYears: number
): Organization[] {
  const cutoffDate = new Date()
  cutoffDate.setFullYear(cutoffDate.getFullYear() - inactiveYears)

  const cutoffDateInteger = dateTimeFns.dateToInteger(cutoffDate)

  const database = sqlite(databasePath, {
    readonly: true
  })

  const rows = database
    .prepare(
      `select o.organizationID, o.organizationName,
        o.recordCreate_timeMillis, o.recordCreate_userName,
        o.recordUpdate_timeMillis, o.recordUpdate_userName,
        l.licences_endDateMax
        from Organizations o
        left join (
          select l.organizationID, max(l.endDate) as licences_endDateMax
          from LotteryLicences l
          where l.recordDelete_timeMillis is null
          group by l.organizationID
        ) l on o.organizationID = l.organizationID
         where o.recordDelete_timeMillis is null
         and (l.licences_endDateMax is null or l.licences_endDateMax <= ?)
         order by o.organizationName, o.organizationID`
    )
    .all(cutoffDateInteger) as Organization[]

  database.close()

  for (const organization of rows) {
    organization.recordCreate_dateString = dateTimeFns.dateToString(
      new Date(organization.recordCreate_timeMillis)
    )
    organization.recordUpdate_dateString = dateTimeFns.dateToString(
      new Date(organization.recordUpdate_timeMillis)
    )
    organization.licences_endDateMaxString = dateTimeFns.dateIntegerToString(
      organization.licences_endDateMax || 0
    )
  }

  return rows
}
