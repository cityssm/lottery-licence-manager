import type { RequestHandler } from "express";

import { getDistinctTermsConditions } from "../../helpers/licencesDB/getDistinctTermsConditions.js";


export const handler: RequestHandler = (request, response) => {

  const organizationID = request.body.organizationID;

  response.json(getDistinctTermsConditions(organizationID));

};


export default handler;
