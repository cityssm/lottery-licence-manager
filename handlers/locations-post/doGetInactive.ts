import type { Request, Response } from 'express'

import getInactiveLocations from '../../helpers/licencesDB/getInactiveLocations.js'
import type { Location } from '../../types/recordTypes.js'

export default function handler(
  request: Request<unknown, unknown, { inactiveYears: string }>,
  response: Response<Location[]>
): void {
  const inactiveYears = Number.parseInt(request.body.inactiveYears, 10)

  response.json(getInactiveLocations(inactiveYears))
}
