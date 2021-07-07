import type { RequestHandler } from "express";

import { voidTransaction } from "../../helpers/licencesDB/voidTransaction.js";


export const handler: RequestHandler = (request, response) => {

  const success = voidTransaction(request.body.licenceID, request.body.transactionIndex, request.session);

  if (success) {

    response.json({
      success: true,
      message: "Transaction Voided Successfully"
    });

  } else {

    response.json({
      success: false,
      message: "Transaction Not Voided"
    });
  }
};


export default handler;
