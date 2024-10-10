import type { Request, Response } from 'express'

import deleteOrganizationBankRecord from '../../helpers/licencesDB/deleteOrganizationBankRecord.js'

interface DoDeleteBankRecordRequest {
  organizationID: string
  recordIndex: string
}

export default function handler(
  request: Request<unknown, unknown, DoDeleteBankRecordRequest>,
  response: Response
): void {
  const success = deleteOrganizationBankRecord(
    request.body.organizationID,
    request.body.recordIndex,
    request.session.user
  )

  if (success) {
    response.json({
      success: true,
      message: 'Organization updated successfully.'
    })
  } else {
    response.json({
      success: false,
      message: 'Record Not Saved'
    })
  }
}
