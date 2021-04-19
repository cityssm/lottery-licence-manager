import type { RequestHandler } from "express";

import { deleteLicence } from "../../helpers/licencesDB/deleteLicence.js";


export const handler: RequestHandler = (req, res) => {

  if (req.body.licenceID === "") {

    res.json({
      success: false,
      message: "Licence ID Unavailable"
    });

  } else {

    const changeCount = deleteLicence(req.body.licenceID, req.session);

    if (changeCount) {

      res.json({
        success: true,
        message: "Licence Deleted"
      });

    } else {

      res.json({
        success: false,
        message: "Licence Not Deleted"
      });
    }
  }
};
