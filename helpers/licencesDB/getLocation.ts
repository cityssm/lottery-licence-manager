import sqlite from 'better-sqlite3'

import { licencesDB as databasePath } from '../../data/databasePaths.js'
import type { Location, User } from '../../types/recordTypes.js'
import { canUpdateObject } from '../licencesDB.js'

export default function getLocation(
  locationID: number,
  requestUser: User
): Location | undefined {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const locationObject = database
    .prepare('select * from Locations where locationID = ?')
    .get(locationID) as Location | undefined

  if (locationObject !== undefined) {
    locationObject.recordType = 'location'

    locationObject.locationDisplayName =
      locationObject.locationName === ''
        ? locationObject.locationAddress1
        : locationObject.locationName

    locationObject.canUpdate = canUpdateObject(locationObject, requestUser)
  }

  database.close()

  return locationObject
}
