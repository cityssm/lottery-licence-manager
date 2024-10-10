import type { Request, Response } from 'express'

import getOrganizations, {
  type GetOrganizationsFilters
} from '../../helpers/licencesDB/getOrganizations.js'

export default function handler(
  request: Request<unknown, unknown, GetOrganizationsFilters>,
  response: Response
): void {
  response.json(
    getOrganizations(request.body, request.session.user, {
      limit: 100,
      offset: 0
    })
  )
}
