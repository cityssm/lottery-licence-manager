import type { NextFunction, Request, Response } from 'express'

import updateOrganizationRepresentative from '../../helpers/licencesDB/updateOrganizationRepresentative.js'
import type { OrganizationRepresentative } from '../../types/recordTypes.js'

export default function handler(
  request: Request<
    { organizationID: string },
    unknown,
    OrganizationRepresentative
  >,
  response: Response,
  next: NextFunction
): void {
  const organizationID = Number.parseInt(request.params.organizationID, 10)

  if (Number.isNaN(organizationID)) {
    next()
    return
  }

  const representativeObject = updateOrganizationRepresentative(
    organizationID,
    request.body
  )

  response.json({
    success: true,
    organizationRepresentative: representativeObject
  })
}
