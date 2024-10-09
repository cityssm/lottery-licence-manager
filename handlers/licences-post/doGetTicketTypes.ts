import type { Request, Response } from 'express'

import * as configFunctions from '../../helpers/functions.config.js'

export default function handler(
  request: Request<unknown, unknown, { licenceTypeKey: string }>,
  response: Response
): void {
  const licenceTypeKey = request.body.licenceTypeKey

  const licenceType = configFunctions.getLicenceType(licenceTypeKey)

  if (licenceType === undefined) {
    response.json([])
  } else {
    response.json(licenceType.ticketTypes ?? [])
  }
}
