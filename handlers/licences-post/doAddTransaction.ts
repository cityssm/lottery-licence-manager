import type { RequestHandler } from "express";

import * as licencesDB_addTransaction from "../../helpers/licencesDB/addTransaction";


export const handler: RequestHandler = (req, res) => {

  const newTransactionIndex = licencesDB_addTransaction.addTransaction(req.body, req.session);

  res.json({
    success: true,
    message: "Transaction Added Successfully",
    transactionIndex: newTransactionIndex
  });
};
