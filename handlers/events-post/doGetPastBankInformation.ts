import type { Request, Response } from 'express'

import { getPastEventBankingInformation } from '../../helpers/licencesDB/getPastEventBankingInformation.js'

export default function handler(
  request: Request<unknown, unknown, { licenceID: string }>,
  response: Response
): void {
  const bankInfoList = getPastEventBankingInformation(request.body.licenceID)
  response.json(bankInfoList)
}
