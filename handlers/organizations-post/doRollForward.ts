import type { Request, Response } from 'express'

import rollForwardOrganization from '../../helpers/licencesDB/rollForwardOrganization.js'

interface DoRollForwardRequest {
  organizationID: string
  updateFiscalYear: string
  updateReminders: string
}

export default function handler(
  request: Request<unknown, unknown, DoRollForwardRequest>,
  response: Response
): void {
  const organizationID = Number.parseInt(request.body.organizationID, 10)

  const updateFiscalYear = request.body.updateFiscalYear === '1'
  const updateReminders = request.body.updateReminders === '1'

  const result = rollForwardOrganization(
    organizationID,
    updateFiscalYear,
    updateReminders,
    request.session.user
  )

  response.json(result)
}
