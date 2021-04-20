import type { RequestHandler } from "express";

import { getEventFinancialSummary } from "../../helpers/licencesDB/getEventFinancialSummary.js";


export const handler: RequestHandler = (req, res) => {

  const summary = getEventFinancialSummary(req.body);
  res.json(summary);
};


export default handler;
