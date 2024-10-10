import type { Request, Response } from 'express'

import addOrganizationBankRecord from '../../helpers/licencesDB/addOrganizationBankRecord.js'
import type { OrganizationBankRecord } from '../../types/recordTypes.js'

export default function handler(
  request: Request<unknown, unknown, OrganizationBankRecord>,
  response: Response
): void {
  const success = addOrganizationBankRecord(request.body, request.session.user)

  if (success) {
    response.json({
      success: true,
      message: 'Record added successfully.'
    })
  } else {
    response.json({
      success: false,
      message:
        'Please make sure that the record you are trying to create does not already exist.'
    })
  }
}
