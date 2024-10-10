import type { Request, Response } from 'express'

import getApplicationSettings from '../../helpers/licencesDB/getApplicationSettings.js'

export default function handler(_request: Request, response: Response): void {
  const applicationSettings = getApplicationSettings()

  response.render('admin-applicationSettings', {
    headTitle: 'Application Settings',
    applicationSettings
  })
}
