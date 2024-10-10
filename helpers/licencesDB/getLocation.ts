import sqlite from 'better-sqlite3'
import type * as expressSession from 'express-session'

import { licencesDB as databasePath } from '../../data/databasePaths.js'
import type { Location } from '../../types/recordTypes.js'
import { canUpdateObject } from '../licencesDB.js'

export default function getLocation(
  locationID: number,
  requestSession: expressSession.Session
): Location | undefined {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const locationObject = database
    .prepare('select * from Locations' + ' where locationID = ?')
    .get(locationID) as Location | undefined

  if (locationObject !== undefined) {
    locationObject.recordType = 'location'

    locationObject.locationDisplayName =
      locationObject.locationName === ''
        ? locationObject.locationAddress1
        : locationObject.locationName

    locationObject.canUpdate = canUpdateObject(locationObject, requestSession)
  }

  database.close()

  return locationObject
}
