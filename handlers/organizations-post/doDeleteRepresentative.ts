import type { RequestHandler } from "express";

import { deleteOrganizationRepresentative } from "../../helpers/licencesDB/deleteOrganizationRepresentative";


export const handler: RequestHandler = (req, res) => {

  const organizationID = parseInt(req.params.organizationID, 10);
  const representativeIndex = req.body.representativeIndex;

  const success = deleteOrganizationRepresentative(organizationID, representativeIndex);

  res.json({
    success
  });
};
