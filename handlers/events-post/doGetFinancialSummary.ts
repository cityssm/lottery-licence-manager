import type { RequestHandler } from "express";

import { getEventFinancialSummary } from "../../helpers/licencesDB/getEventFinancialSummary";


export const handler: RequestHandler = (req, res) => {

  const summary = getEventFinancialSummary(req.body);
  res.json(summary);
};
