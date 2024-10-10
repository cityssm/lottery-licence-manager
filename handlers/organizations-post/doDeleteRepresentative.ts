import type { NextFunction, Request, Response } from 'express'

import deleteOrganizationRepresentative from '../../helpers/licencesDB/deleteOrganizationRepresentative.js'

export default function handler(
  request: Request<
    { organizationID: string },
    unknown,
    { representativeIndex: string }
  >,
  response: Response,
  next: NextFunction
): void {
  const organizationID = Number.parseInt(request.params.organizationID, 10)
  const representativeIndex = Number.parseInt(
    request.body.representativeIndex,
    10
  )

  if (Number.isNaN(organizationID) || Number.isNaN(representativeIndex)) {
    next()
    return
  }

  const success = deleteOrganizationRepresentative(
    organizationID,
    representativeIndex
  )

  response.json({
    success
  })
}
