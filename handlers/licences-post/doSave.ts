import type { RequestHandler } from "express";

import { createLicence } from "../../helpers/licencesDB/createLicence.js";
import { updateLicence } from "../../helpers/licencesDB/updateLicence.js";


export const handler: RequestHandler = (request, response) => {

  if (request.body.licenceID === "") {

    const newLicenceID = createLicence(request.body, request.session);

    response.json({
      success: true,
      licenceID: newLicenceID
    });

  } else {

    const changeCount = updateLicence(request.body, request.session);

    if (changeCount) {

      response.json({
        success: true,
        message: "Licence updated successfully."
      });

    } else {

      response.json({
        success: false,
        message: "Record Not Saved"
      });

    }
  }
};


export default handler;
