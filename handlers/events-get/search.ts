import type { Request, Response } from 'express'

import * as licencesDB from '../../helpers/licencesDB.js'

export default function handler(_request: Request, response: Response): void {
  const eventTableStats = licencesDB.getEventTableStats()

  response.render('event-search', {
    headTitle: 'Lottery Events',
    eventTableStats
  })
}
