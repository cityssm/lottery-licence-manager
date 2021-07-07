import type { RequestHandler } from "express";

import { updateLocation } from "../../helpers/licencesDB/updateLocation.js";


export const handler: RequestHandler = (request, response) => {

  const changeCount = updateLocation(request.body, request.session);

  return changeCount
    ? response.json({
      success: true,
      message: "Location updated successfully."
    })
    : response.json({
      success: false,
      message: "Record Not Saved"
    });
};


export default handler;
