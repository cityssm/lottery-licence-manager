import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'

import type { Organization, User } from '../../types/recordTypes.js'

import { runSQL_hasChanges } from './_runSQL.js'

export default function updateOrganization(
  requestBody: Organization,
  requestUser: User
): boolean {
  return runSQL_hasChanges(
    `update Organizations
      set organizationName = ?,
      organizationAddress1 = ?,
      organizationAddress2 = ?,
      organizationCity = ?,
      organizationProvince = ?,
      organizationPostalCode = ?,
      trustAccountNumber = ?,
      fiscalStartDate = ?,
      fiscalEndDate = ?,
      isEligibleForLicences = ?,
      organizationNote = ?,
      recordUpdate_userName = ?,
      recordUpdate_timeMillis = ?
      where organizationID = ?
      and recordDelete_timeMillis is null`,
    [
      requestBody.organizationName,
      requestBody.organizationAddress1,
      requestBody.organizationAddress2,
      requestBody.organizationCity,
      requestBody.organizationProvince,
      requestBody.organizationPostalCode,
      requestBody.trustAccountNumber,
      dateTimeFns.dateStringToInteger(requestBody.fiscalStartDateString),
      dateTimeFns.dateStringToInteger(requestBody.fiscalEndDateString),
      requestBody.isEligibleForLicences,
      requestBody.organizationNote,
      requestUser.userName,
      Date.now(),
      requestBody.organizationID
    ]
  )
}
