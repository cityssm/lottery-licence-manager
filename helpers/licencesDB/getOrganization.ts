import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'
import sqlite from 'better-sqlite3'
import type * as expressSession from 'express-session'

import { licencesDB as databasePath } from '../../data/databasePaths.js'
import type * as llm from '../../types/recordTypes.js'
import { canUpdateObject } from '../licencesDB.js'

export default function getOrganization(
  organizationID: number,
  requestSession: expressSession.Session
): llm.Organization | undefined {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const organizationObject = database
    .prepare('select * from Organizations where organizationID = ?')
    .get(organizationID) as llm.Organization | undefined

  if (organizationObject) {
    organizationObject.recordType = 'organization'

    organizationObject.fiscalStartDateString = dateTimeFns.dateIntegerToString(
      organizationObject.fiscalStartDate
    )
    organizationObject.fiscalEndDateString = dateTimeFns.dateIntegerToString(
      organizationObject.fiscalEndDate
    )

    organizationObject.canUpdate = canUpdateObject(
      organizationObject,
      requestSession
    )

    const representativesList = database
      .prepare(
        'select * from OrganizationRepresentatives' +
          ' where organizationID = ?' +
          ' order by isDefault desc, representativeName'
      )
      .all(organizationID) as llm.OrganizationRepresentative[]

    organizationObject.organizationRepresentatives = representativesList
  }

  database.close()

  return organizationObject
}
