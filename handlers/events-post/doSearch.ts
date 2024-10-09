import type { Request, Response } from 'express'

import getEvents, {
  type GetEventsFilters
} from '../../helpers/licencesDB/getEvents.js'

export function handler(
  request: Request<
    unknown,
    unknown,
    GetEventsFilters & { limit: string; offset: string }
  >,
  response: Response
): void {
  response.json(
    getEvents(request.body, request.session, {
      limit: Number.parseInt(request.body.limit, 10),
      offset: Number.parseInt(request.body.offset, 10)
    })
  )
}

export default handler
