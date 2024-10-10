import type { Request, Response } from 'express'

import deleteOrganizationRemark from '../../helpers/licencesDB/deleteOrganizationRemark.js'

interface DoDeleteRemarkRequest {
  organizationID: string
  remarkIndex: string
}

export default function handler(
  request: Request<unknown, unknown, DoDeleteRemarkRequest>,
  response: Response
): void {
  const organizationID = request.body.organizationID
  const remarkIndex = request.body.remarkIndex

  const success = deleteOrganizationRemark(
    organizationID,
    remarkIndex,
    request.session.user
  )

  if (success) {
    response.json({
      success: true,
      message: 'Remark deleted successfully.'
    })
  } else {
    response.json({
      success: false,
      message: 'Remark could not be deleted.'
    })
  }
}
