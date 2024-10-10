import type { Request, Response } from 'express'

import deleteLocation from '../../helpers/licencesDB/deleteLocation.js'

export interface DoDeleteLocationResponse {
  success: boolean
  message: string
}

export default function handler(
  request: Request<unknown, unknown, { locationID: string }>,
  response: Response<DoDeleteLocationResponse>
): void {
  const hasChanges = deleteLocation(
    request.body.locationID,
    request.session.user
  )

  if (hasChanges) {
    response.json({
      success: true,
      message: 'Location deleted successfully.'
    })
  } else {
    response.json({
      success: false,
      message: 'Location could not be deleted.'
    })
  }
}
