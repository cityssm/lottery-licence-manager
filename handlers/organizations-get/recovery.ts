import type { Request, Response } from 'express'

import getDeletedOrganizations from '../../helpers/licencesDB/getDeletedOrganizations.js'

export default function handler(_request: Request, response: Response): void {
  const organizations = getDeletedOrganizations()

  response.render('organization-recovery', {
    headTitle: 'Organization Recovery',
    organizations
  })
}
