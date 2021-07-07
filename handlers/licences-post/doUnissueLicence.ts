import type { RequestHandler } from "express";

import { unissueLicence } from "../../helpers/licencesDB/unissueLicence.js";


export const handler: RequestHandler = (request, response) => {

  const success = unissueLicence(request.body.licenceID, request.session);

  if (success) {

    response.json({
      success: true,
      message: "Licence Unissued Successfully"
    });

  } else {

    response.json({
      success: false,
      message: "Licence Not Unissued"
    });

  }
};


export default handler;
