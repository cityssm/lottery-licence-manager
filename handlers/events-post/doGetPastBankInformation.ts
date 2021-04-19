import type { RequestHandler } from "express";

import { getPastEventBankingInformation } from "../../helpers/licencesDB/getPastEventBankingInformation.js";


export const handler: RequestHandler = (req, res) => {

  const bankInfoList = getPastEventBankingInformation(req.body.licenceID);
  res.json(bankInfoList);

};
