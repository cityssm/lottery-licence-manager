import type { Request, Response } from 'express'

import createLocation from '../../helpers/licencesDB/createLocation.js'
import type { Location } from '../../types/recordTypes.js'

export interface DoCreateLocationResponse {
  success: true
  locationID: number
  locationDisplayName: string
}

export default function handler(
  request: Request<unknown, unknown, Location>,
  response: Response<DoCreateLocationResponse>
): void {
  const locationID = createLocation(request.body, request.session.user)

  response.json({
    success: true,
    locationID,
    locationDisplayName:
      request.body.locationName === ''
        ? request.body.locationAddress1
        : request.body.locationName
  })
}
