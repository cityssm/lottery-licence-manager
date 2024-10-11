import type { Request, Response } from 'express'

import getOutstandingEvents from '../../helpers/licencesDB/getOutstandingEvents.js'
import type { LotteryEvent } from '../../types/recordTypes.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    { eventDateType: '' | 'past' | 'upcoming'; licenceTypeKey: string }
  >,
  response: Response<LotteryEvent[]>
): void {
  const events = getOutstandingEvents(request.body, request.session.user)
  response.json(events)
}
