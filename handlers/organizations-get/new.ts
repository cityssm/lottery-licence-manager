import type { Request, Response } from 'express'

import * as configFunctions from '../../helpers/functions.config.js'

export default function handler(_request: Request, response: Response): void {
  response.render('organization-edit', {
    headTitle: 'Organization Create',
    isViewOnly: false,
    isCreate: true,
    organization: {
      organizationCity: configFunctions.getProperty('defaults.city'),
      organizationProvince: configFunctions.getProperty('defaults.province')
    }
  })
}
