import { dateToInteger } from '@cityssm/expressjs-server-js/dateTimeFns.js'
import type { Request, Response } from 'express'

import { getProperty } from '../../helpers/functions.config.js'

export default function handler(_request: Request, response: Response): void {
  response.render('location-edit', {
    headTitle: 'Create a New Location',
    location: {
      locationCity: getProperty('defaults.city'),
      locationProvince: getProperty('defaults.province')
    },
    currentDateInteger: dateToInteger(new Date()),
    isCreate: true
  })
}
