import type { RequestHandler } from "express";

import { createOrganization } from "../../helpers/licencesDB/createOrganization";
import { updateOrganization } from "../../helpers/licencesDB/updateOrganization";


export const handler: RequestHandler = (req, res) => {

  if (req.body.organizationID === "") {

    const newOrganizationID = createOrganization(req.body, req.session);

    res.json({
      success: true,
      organizationID: newOrganizationID
    });

  } else {

    const success = updateOrganization(req.body, req.session);

    if (success) {

      return res.json({
        success: true,
        message: "Organization updated successfully."
      });

    } else {

      return res.json({
        success: false,
        message: "Record Not Saved"
      });
    }
  }
};
