import type { RequestHandler } from "express";

import { updateEvent } from "../../helpers/licencesDB/updateEvent.js";


export const handler: RequestHandler = (req, res) => {

  const changeCount = updateEvent(req.body, req.session);

  if (changeCount) {

    res.json({
      success: true,
      message: "Event updated successfully."
    });

  } else {

    res.json({
      success: false,
      message: "Record Not Saved"
    });

  }
};
