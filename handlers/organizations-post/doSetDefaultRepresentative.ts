import type { RequestHandler } from "express";

import { setDefaultOrganizationRepresentative } from "../../helpers/licencesDB/setDefaultOrganizationRepresentative";


export const handler: RequestHandler = (req, res) => {

  const organizationID = parseInt(req.params.organizationID, 10);
  const isDefaultRepresentativeIndex = req.body.isDefaultRepresentativeIndex;

  const success =
    setDefaultOrganizationRepresentative(organizationID, isDefaultRepresentativeIndex);

  res.json({
    success
  });
};
