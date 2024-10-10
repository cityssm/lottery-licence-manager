import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'
import type { Request, Response } from 'express'

import { getLicenceTableStats } from '../../helpers/licencesDB.js'

export default function handler(_request: Request, response: Response): void {
  // Get licence table stats

  const licenceTableStats = getLicenceTableStats()

  // Set application dates
  const applicationDate = new Date()

  applicationDate.setMonth(applicationDate.getMonth() - 1)
  applicationDate.setDate(1)

  const applicationDateStartString = dateTimeFns.dateToString(applicationDate)

  applicationDate.setMonth(applicationDate.getMonth() + 1)
  applicationDate.setDate(0)

  const applicationDateEndString = dateTimeFns.dateToString(applicationDate)

  // Render
  response.render('licence-licenceType', {
    headTitle: 'Licence Type Summary',
    applicationYearMin:
      licenceTableStats.applicationYearMin || new Date().getFullYear(),
    applicationDateStartString,
    applicationDateEndString
  })
}
