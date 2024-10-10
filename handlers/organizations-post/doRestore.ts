import type { Request, Response } from 'express'

import restoreOrganization from '../../helpers/licencesDB/restoreOrganization.js'

export default function handler(
  request: Request<unknown, unknown, { organizationID: string }>,
  response: Response
): void {
  const success = restoreOrganization(
    request.body.organizationID,
    request.session.user
  )

  if (success) {
    response.json({
      success: true,
      message: 'Organization restored successfully.'
    })
  } else {
    response.json({
      success: false,
      message: 'Organization could not be restored.'
    })
  }
}
