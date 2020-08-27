import type { RequestHandler } from "express";

import * as licencesDB_voidTransaction from "../../helpers/licencesDB/voidTransaction";


export const handler: RequestHandler = (req, res) => {

  const success = licencesDB_voidTransaction.voidTransaction(req.body.licenceID, req.body.transactionIndex, req.session);

  if (success) {

    res.json({
      success: true,
      message: "Transaction Voided Successfully"
    });

  } else {

    res.json({
      success: false,
      message: "Transaction Not Voided"
    });
  }
};
