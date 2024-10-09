import type { Request, Response } from 'express'

import { getEventFinancialSummary } from '../../helpers/licencesDB/getEventFinancialSummary.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    { eventDateStartString: string; eventDateEndString: string }
  >,
  response: Response
): void {
  const summary = getEventFinancialSummary(request.body)
  response.json(summary)
}
