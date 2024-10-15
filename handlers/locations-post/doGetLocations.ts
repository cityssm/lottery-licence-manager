import type { Request, Response } from 'express'

import getLocations, {
  type GetLocationsReturn
} from '../../helpers/licencesDB/getLocations.js'

export interface DoGetLocationsRequest {
  limit?: string
  offset?: string
  locationNameAddress: string
  locationIsManufacturer: '' | '0' | '1'
  locationIsDistributor: '' | '0' | '1'
  locationIsActive?: 'on'
}

export default function handler(
  request: Request<unknown, unknown, DoGetLocationsRequest>,
  response: Response<GetLocationsReturn>
): void {
  const locations = getLocations(request.session.user, {
    limit: Number.parseInt(request.body.limit ?? '-1', 10),
    offset: Number.parseInt(request.body.offset ?? '0', 10),
    locationNameAddress: request.body.locationNameAddress,
    locationIsDistributor:
      request.body.locationIsDistributor === ''
        ? -1
        : (Number.parseInt(request.body.locationIsDistributor, 10) as 0 | 1),
    locationIsManufacturer:
      request.body.locationIsManufacturer === ''
        ? -1
        : (Number.parseInt(request.body.locationIsManufacturer, 10) as 0 | 1),
    locationIsActive: request.body.locationIsActive
  })

  response.json(locations)
}
