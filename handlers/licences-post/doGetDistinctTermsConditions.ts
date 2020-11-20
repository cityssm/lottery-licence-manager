import type { RequestHandler } from "express";

import { getDistinctTermsConditions } from "../../helpers/licencesDB/getDistinctTermsConditions";


export const handler: RequestHandler = (req, res) => {

  const organizationID = req.body.organizationID;

  res.json(getDistinctTermsConditions(organizationID));

};
