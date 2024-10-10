import type { Request, Response } from 'express'

import createOrganization from '../../helpers/licencesDB/createOrganization.js'
import updateOrganization from '../../helpers/licencesDB/updateOrganization.js'
import type { Organization } from '../../types/recordTypes.js'

export default function handler(
  request: Request<unknown, unknown, Organization>,
  response: Response
): void {
  if (request.body.organizationID === '') {
    const newOrganizationID = createOrganization(
      request.body,
      request.session.user
    )

    response.json({
      success: true,
      organizationID: newOrganizationID
    })
  } else {
    const success = updateOrganization(request.body, request.session.user)

    if (success) {
      response.json({
        success: true,
        message: 'Organization updated successfully.'
      })
    } else {
      response.json({
        success: false,
        message: 'Record Not Saved'
      })
    }
  }
}
