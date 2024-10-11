import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'
import type { Request, Response } from 'express'

import getLicenceActivityByDateRange, {
  type GetLicenceActivityByDateRangeReturn
} from '../../helpers/licencesDB/getLicenceActivityByDateRange.js'

export default function handler(
  request: Request<unknown, unknown, { eventDate: string }>,
  response: Response<GetLicenceActivityByDateRangeReturn>
): void {
  const dateWithinWeek = dateTimeFns.dateStringToDate(request.body.eventDate)

  dateWithinWeek.setDate(dateWithinWeek.getDate() - dateWithinWeek.getDay())

  const startDateInteger = dateTimeFns.dateToInteger(dateWithinWeek)

  dateWithinWeek.setDate(dateWithinWeek.getDate() + 6)

  const endDateInteger = dateTimeFns.dateToInteger(dateWithinWeek)

  const activity = getLicenceActivityByDateRange(
    startDateInteger,
    endDateInteger
  )

  response.json(activity)
}

export type { GetLicenceActivityByDateRangeReturn as DoGetEventsByWeekResponse } from '../../helpers/licencesDB/getLicenceActivityByDateRange.js'
