import type { Request, Response } from 'express'

import getDistinctTermsConditions from '../../helpers/licencesDB/getDistinctTermsConditions.js'

export default function handler(
  request: Request<unknown, unknown, { organizationID: string }>,
  response: Response
): void {
  const organizationID = request.body.organizationID

  response.json(getDistinctTermsConditions(organizationID))
}
