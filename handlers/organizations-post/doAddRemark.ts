import type { Request, Response } from 'express'

import addOrganizationRemark from '../../helpers/licencesDB/addOrganizationRemark.js'
import type { OrganizationRemark } from '../../types/recordTypes.js'

export default function handler(
  request: Request<unknown, unknown, OrganizationRemark>,
  response: Response
): void {
  const remarkIndex = addOrganizationRemark(request.body, request.session.user)

  response.json({
    success: true,
    message: 'Remark added successfully.',
    remarkIndex
  })
}
