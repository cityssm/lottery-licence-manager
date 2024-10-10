import type { Request, Response } from 'express'

import getOrganizationRemark from '../../helpers/licencesDB/getOrganizationRemark.js'

interface DoGetRemarkRequest {
  organizationID: string
  remarkIndex: string
}

export default function handler(
  request: Request<unknown, unknown, DoGetRemarkRequest>,
  response: Response
): void {
  const organizationID = request.body.organizationID
  const remarkIndex = request.body.remarkIndex

  response.json(
    getOrganizationRemark(organizationID, remarkIndex, request.session.user)
  )
}
