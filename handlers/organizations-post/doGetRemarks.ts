import type { Request, Response } from 'express'

import getOrganizationRemarks from '../../helpers/licencesDB/getOrganizationRemarks.js'

export default function handler(
  request: Request<unknown, unknown, { organizationID: string }>,
  response: Response
): void {
  const organizationID = request.body.organizationID

  response.json(getOrganizationRemarks(organizationID, request.session.user))
}
