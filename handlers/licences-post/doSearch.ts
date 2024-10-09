import type { Request, Response } from 'express'

import getLicences, {
  type GetLicencesFilters
} from '../../helpers/licencesDB/getLicences.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    GetLicencesFilters & { limit: string; offset: string }
  >,
  response: Response
): void {
  response.json(
    getLicences(request.body, request.session, {
      includeOrganization: true,
      limit: Number.parseInt(request.body.limit, 10),
      offset: Number.parseInt(request.body.offset, 10)
    })
  )
}
