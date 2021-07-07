import type { RequestHandler } from "express";

import { getOrganizationRemarks } from "../../helpers/licencesDB/getOrganizationRemarks.js";


export const handler: RequestHandler = (request, response) => {

  const organizationID = request.body.organizationID;

  response.json(getOrganizationRemarks(organizationID, request.session));
};


export default handler;
