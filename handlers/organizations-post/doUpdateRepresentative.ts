import type { RequestHandler } from "express";

import { updateOrganizationRepresentative } from "../../helpers/licencesDB/updateOrganizationRepresentative";


export const handler: RequestHandler = (req, res) => {

  const organizationID = parseInt(req.params.organizationID, 10);

  const representativeObj = updateOrganizationRepresentative(organizationID, req.body);

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
