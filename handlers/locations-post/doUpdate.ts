import type { Request, Response } from 'express'

import updateLocation from '../../helpers/licencesDB/updateLocation.js'
import type { Location } from '../../types/recordTypes.js'

export default function handler(
  request: Request<unknown, unknown, Location>,
  response: Response
): void {
  const hasChanges = updateLocation(request.body, request.session.user)

  if (hasChanges) {
    response.json({
      success: true,
      message: 'Location updated successfully.'
    })
  } else {
    response.json({
      success: false,
      message: 'Record Not Saved'
    })
  }
}
