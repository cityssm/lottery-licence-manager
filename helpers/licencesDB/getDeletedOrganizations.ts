import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'
import sqlite from 'better-sqlite3'

import { licencesDB as databasePath } from '../../data/databasePaths.js'
import type * as llm from '../../types/recordTypes'

export default function getDeletedOrganizations(): llm.Organization[] {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const organizations = database
    .prepare(
      `select organizationID, organizationName,
        recordDelete_timeMillis, recordDelete_userName
        from Organizations
        where recordDelete_timeMillis is not null
        order by organizationName, recordDelete_timeMillis desc`
    )
    .all() as llm.Organization[]

  database.close()

  for (const organization of organizations) {
    organization.recordDelete_dateString = dateTimeFns.dateToString(
      new Date(organization.recordDelete_timeMillis)
    )
  }

  return organizations
}
