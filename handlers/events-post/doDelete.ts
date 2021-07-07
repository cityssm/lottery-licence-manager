import type { RequestHandler } from "express";

import { deleteEvent } from "../../helpers/licencesDB/deleteEvent.js";


export const handler: RequestHandler = (request, response) => {

  if (request.body.licenceID === "" || request.body.eventDate === "") {

    return response.json({
      success: false,
      message: "Licence ID or Event Date Unavailable"
    });
  }

  const madeChanges = deleteEvent(request.body.licenceID, request.body.eventDate, request.session);

  if (madeChanges) {

    return response.json({
      success: true,
      message: "Event Deleted"
    });
  }

  response.json({
    success: false,
    message: "Event Not Deleted"
  });
};


export default handler;
