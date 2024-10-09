import type { Request, Response } from 'express'

import { getOutstandingEvents } from '../../helpers/licencesDB/getOutstandingEvents.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    { eventDateType: '' | 'past' | 'upcoming'; licenceTypeKey: string }
  >,
  response: Response
): void {
  const events = getOutstandingEvents(request.body, request.session)
  response.json(events)
}
