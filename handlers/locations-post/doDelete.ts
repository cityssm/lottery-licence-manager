import type { RequestHandler } from "express";

import { deleteLocation } from "../../helpers/licencesDB/deleteLocation.js";


export const handler: RequestHandler = (request, response) => {

  const changeCount = deleteLocation(request.body.locationID, request.session);

  return changeCount
    ? response.json({
      success: true,
      message: "Location deleted successfully."
    })
    : response.json({
      success: false,
      message: "Location could not be deleted."
    });
};


export default handler;
