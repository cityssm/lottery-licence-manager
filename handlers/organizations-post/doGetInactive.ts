import type { Request, Response } from 'express'

import getInactiveOrganizations from '../../helpers/licencesDB/getInactiveOrganizations.js'

export default function handler(
  request: Request<unknown, unknown, { inactiveYears: string }>,
  response: Response
): void {
  const inactiveYears = Number.parseInt(request.body.inactiveYears, 10)

  response.json(getInactiveOrganizations(inactiveYears))
}
