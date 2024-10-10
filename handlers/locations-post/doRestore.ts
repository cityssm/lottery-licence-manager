import type { Request, Response } from 'express'

import restoreLocation from '../../helpers/licencesDB/restoreLocation.js'

export interface DoRestoreLocationResponse {
  success: boolean
  message: string
}

export default function handler(
  request: Request<unknown, unknown, { locationID: string }>,
  response: Response<DoRestoreLocationResponse>
): void {
  const hasChanges = restoreLocation(
    request.body.locationID,
    request.session.user
  )

  if (hasChanges) {
    response.json({
      success: true,
      message: 'Location restored successfully.'
    })
  } else {
    response.json({
      success: false,
      message: 'Location could not be restored.'
    })
  }
}
