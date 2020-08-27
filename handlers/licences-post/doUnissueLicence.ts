import type { RequestHandler } from "express";

import * as licencesDB_unissueLicence from "../../helpers/licencesDB/unissueLicence";


export const handler: RequestHandler = (req, res) => {

  if (!req.session.user.userProperties.canCreate) {

    res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
      });
    return;

  }

  const success = licencesDB_unissueLicence.unissueLicence(req.body.licenceID, req.session);

  if (success) {

    res.json({
      success: true,
      message: "Licence Unissued Successfully"
    });

  } else {

    res.json({
      success: false,
      message: "Licence Not Unissued"
    });

  }
};
