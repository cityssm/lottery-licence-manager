import type { RequestHandler } from "express";

import { updateEvent } from "../../helpers/licencesDB/updateEvent.js";


export const handler: RequestHandler = (request, response) => {

  const changeCount = updateEvent(request.body, request.session);

  if (changeCount) {

    response.json({
      success: true,
      message: "Event updated successfully."
    });

  } else {

    response.json({
      success: false,
      message: "Record Not Saved"
    });

  }
};


export default handler;
