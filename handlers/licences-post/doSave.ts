import type { RequestHandler } from "express";

import { createLicence } from "../../helpers/licencesDB/createLicence.js";
import { updateLicence } from "../../helpers/licencesDB/updateLicence.js";


export const handler: RequestHandler = (req, res) => {

  if (req.body.licenceID === "") {

    const newLicenceID = createLicence(req.body, req.session);

    res.json({
      success: true,
      licenceID: newLicenceID
    });

  } else {

    const changeCount = updateLicence(req.body, req.session);

    if (changeCount) {

      res.json({
        success: true,
        message: "Licence updated successfully."
      });

    } else {

      res.json({
        success: false,
        message: "Record Not Saved"
      });

    }
  }
};
