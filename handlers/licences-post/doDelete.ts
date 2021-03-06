import type { RequestHandler } from "express";

import { deleteLicence } from "../../helpers/licencesDB/deleteLicence.js";


export const handler: RequestHandler = (request, response) => {

  if (request.body.licenceID === "") {

    response.json({
      success: false,
      message: "Licence ID Unavailable"
    });

  } else {

    const changeCount = deleteLicence(request.body.licenceID, request.session);

    if (changeCount) {

      response.json({
        success: true,
        message: "Licence Deleted"
      });

    } else {

      response.json({
        success: false,
        message: "Licence Not Deleted"
      });
    }
  }
};


export default handler;
