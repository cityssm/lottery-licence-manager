import type { RequestHandler } from "express";

import { getOrganizationBankRecordStats } from "../../helpers/licencesDB/getOrganizationBankRecordStats.js";


export const handler: RequestHandler = (request, response) => {

  const organizationID = request.body.organizationID;
  response.json(getOrganizationBankRecordStats(organizationID));

};


export default handler;
