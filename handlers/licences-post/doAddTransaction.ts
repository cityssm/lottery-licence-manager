import type { Request, Response } from 'express'

import addTransaction, {
  type AddTransactionForm
} from '../../helpers/licencesDB/addTransaction.js'

export default function handler(
  request: Request<unknown, unknown, AddTransactionForm>,
  response: Response
): void {
  const newTransactionIndex = addTransaction(request.body, request.session)

  response.json({
    success: true,
    message: 'Transaction Added Successfully',
    transactionIndex: newTransactionIndex
  })
}
