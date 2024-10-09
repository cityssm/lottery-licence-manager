import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'
import type { Request, Response } from 'express'

import * as licencesDB from '../../helpers/licencesDB.js'

export default function handler(_request: Request, response: Response): void {
  // Get licence table stats
  const licenceTableStats = licencesDB.getLicenceTableStats()

  // Set start dates
  const startDate = new Date()

  startDate.setDate(1)

  const startDateStartString = dateTimeFns.dateToString(startDate)

  startDate.setMonth(startDate.getMonth() + 1)
  startDate.setDate(0)

  const startDateEndString = dateTimeFns.dateToString(startDate)

  // Render
  response.render('licence-activeSummary', {
    headTitle: 'Active Licence Summary',
    startYearMin: licenceTableStats.startYearMin || new Date().getFullYear(),
    startDateStartString,
    startDateEndString
  })
}
