import type { RequestHandler } from "express";

import { getPastEventBankingInformation } from "../../helpers/licencesDB/getPastEventBankingInformation.js";


export const handler: RequestHandler = (request, response) => {

  const bankInfoList = getPastEventBankingInformation(request.body.licenceID);
  response.json(bankInfoList);

};


export default handler;
