import type { Request, Response } from 'express'

import { deleteOrganization } from '../../helpers/licencesDB/deleteOrganization.js'

export default function handler(
  request: Request<unknown, unknown, { organizationID: string }>,
  response: Response
): void {
  const success = deleteOrganization(
    request.body.organizationID,
    request.session.user
  )

  if (success) {
    response.json({
      success: true,
      message: 'Organization deleted successfully.'
    })
  } else {
    response.json({
      success: false,
      message: 'Organization could not be deleted.'
    })
  }
}
