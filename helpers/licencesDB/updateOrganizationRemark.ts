import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'

import type { OrganizationRemark, User } from '../../types/recordTypes.js'

import { runSQL_hasChanges } from './_runSQL.js'

export default function updateOrganizationRemark(
  requestBody: OrganizationRemark,
  requestUser: User
): boolean {
  return runSQL_hasChanges(
    `update OrganizationRemarks
      set remarkDate = ?,
      remarkTime = ?,
      remark = ?,
      isImportant = ?,
      recordUpdate_userName = ?,
      recordUpdate_timeMillis = ?
      where organizationID = ?
      and remarkIndex = ?
      and recordDelete_timeMillis is null`,
    [
      dateTimeFns.dateStringToInteger(requestBody.remarkDateString),
      dateTimeFns.timeStringToInteger(requestBody.remarkTimeString),
      requestBody.remark,
      requestBody.isImportant ? 1 : 0,
      requestUser.userName,
      Date.now(),
      requestBody.organizationID,
      requestBody.remarkIndex
    ]
  )
}
