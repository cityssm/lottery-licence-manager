import type { RequestHandler } from "express";

import { deleteOrganizationRepresentative } from "../../helpers/licencesDB/deleteOrganizationRepresentative";


export const handler: RequestHandler = (req, res, next) => {

  const organizationID = Number(req.params.organizationID);
  const representativeIndex = Number(req.body.representativeIndex);

  if (isNaN(organizationID) || isNaN(representativeIndex)) {
    return next();
  }

  const success = deleteOrganizationRepresentative(organizationID, representativeIndex);

  res.json({
    success
  });
};
