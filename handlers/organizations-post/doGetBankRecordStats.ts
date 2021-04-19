import type { RequestHandler } from "express";

import { getOrganizationBankRecordStats } from "../../helpers/licencesDB/getOrganizationBankRecordStats.js";


export const handler: RequestHandler = (req, res) => {

  const organizationID = req.body.organizationID;
  res.json(getOrganizationBankRecordStats(organizationID));

};
