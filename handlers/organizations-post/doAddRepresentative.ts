import { addOrganizationRepresentative } from "../../helpers/licencesDB/addOrganizationRepresentative";

import type { RequestHandler } from "express";


export const handler: RequestHandler = (req, res) => {

  const organizationID = parseInt(req.params.organizationID, 10);

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
