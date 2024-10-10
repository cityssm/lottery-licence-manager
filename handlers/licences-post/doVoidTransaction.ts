import type { Request, Response } from 'express'

import voidTransaction from '../../helpers/licencesDB/voidTransaction.js'

export interface DoVoidTransactionRequest {
  licenceID: string
  transactionIndex: string
}

export interface DoVoidTransactionResponse {
  success: boolean
  message: string
}

export default function handler(
  request: Request<unknown, unknown, DoVoidTransactionRequest>,
  response: Response<DoVoidTransactionResponse>
): void {
  const success = voidTransaction(
    request.body.licenceID,
    request.body.transactionIndex,
    request.session
  )

  if (success) {
    response.json({
      success: true,
      message: 'Transaction Voided Successfully'
    })
  } else {
    response.json({
      success: false,
      message: 'Transaction Not Voided'
    })
  }
}
