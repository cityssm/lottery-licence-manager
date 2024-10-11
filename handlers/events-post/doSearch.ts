import type { Request, Response } from 'express'

import getEvents, {
  type GetEventsFilters,
  type GetEventsReturn
} from '../../helpers/licencesDB/getEvents.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    GetEventsFilters & { limit: string; offset: string }
  >,
  response: Response<GetEventsReturn>
): void {
  response.json(
    getEvents(request.body, request.session.user, {
      limit: Number.parseInt(request.body.limit, 10),
      offset: Number.parseInt(request.body.offset, 10)
    })
  )
}

export type { GetEventsReturn as DoSearchEventsResponse } from '../../helpers/licencesDB/getEvents.js'
