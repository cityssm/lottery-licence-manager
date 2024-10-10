import sqlite from 'better-sqlite3'

import { licencesDB as databasePath } from '../../data/databasePaths.js'
import type { OrganizationRepresentative } from '../../types/recordTypes.js'

export default function addOrganizationRepresentative(
  organizationID: number,
  requestBody: OrganizationRepresentative
): OrganizationRepresentative {
  const database = sqlite(databasePath)

  const row = database
    .prepare(
      `select count(representativeIndex) as indexCount,
        ifnull(max(representativeIndex), -1) as maxIndex
        from OrganizationRepresentatives
        where organizationID = ?`
    )
    .get(organizationID) as { indexCount: number; maxIndex: number }

  const newRepresentativeIndex = (row.maxIndex as number) + 1
  const newIsDefault = row.indexCount === 0 ? 1 : 0

  database
    .prepare(
      `insert into OrganizationRepresentatives (
        organizationID, representativeIndex,
        representativeName, representativeTitle,
        representativeAddress1, representativeAddress2,
        representativeCity, representativeProvince, representativePostalCode,
        representativePhoneNumber, representativePhoneNumber2, representativeEmailAddress, isDefault)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      organizationID,
      newRepresentativeIndex,
      requestBody.representativeName,
      requestBody.representativeTitle,
      requestBody.representativeAddress1,
      requestBody.representativeAddress2,
      requestBody.representativeCity,
      requestBody.representativeProvince,
      requestBody.representativePostalCode,
      requestBody.representativePhoneNumber,
      requestBody.representativePhoneNumber2,
      requestBody.representativeEmailAddress,
      newIsDefault
    )

  database.close()

  const representativeObject: OrganizationRepresentative = {
    organizationID,
    representativeIndex: newRepresentativeIndex,
    representativeName: requestBody.representativeName,
    representativeTitle: requestBody.representativeTitle,
    representativeAddress1: requestBody.representativeAddress1,
    representativeAddress2: requestBody.representativeAddress2,
    representativeCity: requestBody.representativeCity,
    representativeProvince: requestBody.representativeProvince,
    representativePostalCode: requestBody.representativePostalCode,
    representativePhoneNumber: requestBody.representativePhoneNumber,
    representativePhoneNumber2: requestBody.representativePhoneNumber2,
    representativeEmailAddress: requestBody.representativeEmailAddress,
    isDefault: newIsDefault === 1
  }

  return representativeObject
}
