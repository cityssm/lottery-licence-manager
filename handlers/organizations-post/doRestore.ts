import type { RequestHandler } from "express";

import { restoreOrganization } from "../../helpers/licencesDB/restoreOrganization.js";


export const handler: RequestHandler = (req, res) => {

  const success = restoreOrganization(req.body.organizationID, req.session);

  if (success) {

    return res.json({
      success: true,
      message: "Organization restored successfully."
    });

  } else {

    return res.json({
      success: false,
      message: "Organization could not be restored."
    });
  }
};
