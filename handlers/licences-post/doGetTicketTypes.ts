import type { Request, Response } from 'express'

import { getLicenceType } from '../../helpers/functions.config.js'
import type { ConfigTicketType } from '../../types/configTypes.js'

export type DoGetTicketTypesResponse = ConfigTicketType[]

export default function handler(
  request: Request<unknown, unknown, { licenceTypeKey: string }>,
  response: Response<DoGetTicketTypesResponse>
): void {
  const licenceTypeKey = request.body.licenceTypeKey

  const licenceType = getLicenceType(licenceTypeKey)

  if (licenceType === undefined) {
    response.json([])
  } else {
    response.json(licenceType.ticketTypes ?? [])
  }
}
