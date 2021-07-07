import type { RequestHandler } from "express";

import { addTransaction } from "../../helpers/licencesDB/addTransaction.js";


export const handler: RequestHandler = (request, response) => {

  const newTransactionIndex = addTransaction(request.body, request.session);

  response.json({
    success: true,
    message: "Transaction Added Successfully",
    transactionIndex: newTransactionIndex
  });
};


export default handler;
