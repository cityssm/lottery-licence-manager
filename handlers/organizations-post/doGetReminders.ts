import type { Request, Response } from 'express'

import getOrganizationReminders from '../../helpers/licencesDB/getOrganizationReminders.js'

export default function handler(
  request: Request<unknown, unknown, { organizationID: string }>,
  response: Response
): void {
  const organizationID = request.body.organizationID

  response.json(getOrganizationReminders(organizationID, request.session.user))
}
