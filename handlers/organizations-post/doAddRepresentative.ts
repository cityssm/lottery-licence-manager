import type { RequestHandler } from "express";

import { addOrganizationRepresentative } from "../../helpers/licencesDB/addOrganizationRepresentative.js";


export const handler: RequestHandler = (req, res, next) => {

  const organizationID = Number(req.params.organizationID);

  if (isNaN(organizationID)) {
    return next();
  }

  const representativeObj = addOrganizationRepresentative(organizationID, req.body);

  if (representativeObj) {

    res.json({
      success: true,
      organizationRepresentative: representativeObj
    });

  } else {

    res.json({
      success: false
    });
  }
};
