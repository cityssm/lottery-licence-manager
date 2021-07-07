import type { RequestHandler } from "express";

import { deleteOrganizationRepresentative } from "../../helpers/licencesDB/deleteOrganizationRepresentative.js";


export const handler: RequestHandler = (request, response, next) => {

  const organizationID = Number(request.params.organizationID);
  const representativeIndex = Number(request.body.representativeIndex);

  if (Number.isNaN(organizationID) || Number.isNaN(representativeIndex)) {
    return next();
  }

  const success = deleteOrganizationRepresentative(organizationID, representativeIndex);

  response.json({
    success
  });
};


export default handler;
