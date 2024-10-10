import type { Request, Response } from 'express'

import getOrganizationBankRecordStats from '../../helpers/licencesDB/getOrganizationBankRecordStats.js'

export default function handler(
  request: Request<unknown, unknown, { organizationID: string }>,
  response: Response
): void {
  const organizationID = request.body.organizationID

  response.json(getOrganizationBankRecordStats(organizationID))
}
