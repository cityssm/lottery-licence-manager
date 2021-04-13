import type { RequestHandler } from "express";

import { setDefaultOrganizationRepresentative } from "../../helpers/licencesDB/setDefaultOrganizationRepresentative";


export const handler: RequestHandler = (req, res, next) => {

  const organizationID = Number(req.params.organizationID);
  const isDefaultRepresentativeIndex = Number(req.body.isDefaultRepresentativeIndex);

  if (isNaN(organizationID) || isNaN(isDefaultRepresentativeIndex)) {
    return next();
  }

  const success =
    setDefaultOrganizationRepresentative(organizationID, isDefaultRepresentativeIndex);

  res.json({
    success
  });
};
