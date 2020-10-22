import type { RequestHandler } from "express";

import * as licencesDB_getDistinctTermsConditions from "../../helpers/licencesDB/getDistinctTermsConditions";


export const handler: RequestHandler = (req, res) => {

  const organizationID = req.body.organizationID;

  res.json(licencesDB_getDistinctTermsConditions.getDistinctTermsConditions(organizationID));

};
