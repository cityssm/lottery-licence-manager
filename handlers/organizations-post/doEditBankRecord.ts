import type { Request, Response } from 'express'

import updateOrganizationBankRecord from '../../helpers/licencesDB/updateOrganizationBankRecord.js'
import type { OrganizationBankRecord } from '../../types/recordTypes.js'

export default function handler(
  request: Request<unknown, unknown, OrganizationBankRecord>,
  response: Response
): void {
  const success = updateOrganizationBankRecord(
    request.body,
    request.session.user
  )

  if (success) {
    response.json({
      success: true,
      message: 'Record updated successfully.'
    })
  } else {
    response.json({
      success: false,
      message: 'Please try again.'
    })
  }
}
