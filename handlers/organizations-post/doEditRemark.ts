import type { Request, Response } from 'express'

import updateOrganizationRemark from '../../helpers/licencesDB/updateOrganizationRemark.js'
import type { OrganizationRemark } from '../../types/recordTypes.js'

export default function handler(
  request: Request<unknown, unknown, OrganizationRemark>,
  response: Response
): void {
  const success = updateOrganizationRemark(request.body, request.session.user)

  if (success) {
    response.json({
      success: true,
      message: 'Remark updated successfully.'
    })
  } else {
    response.json({
      success: false,
      message: 'Remark could not be updated.'
    })
  }
}
