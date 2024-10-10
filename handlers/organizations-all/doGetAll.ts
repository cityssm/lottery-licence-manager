import type { Request, Response } from 'express'

import getOrganizations from '../../helpers/licencesDB/getOrganizations.js'

export default function handler(request: Request, response: Response): void {
  response.json(
    getOrganizations({}, request.session.user, {
      limit: -1
    })
  )
}
