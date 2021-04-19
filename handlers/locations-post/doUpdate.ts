import type { RequestHandler } from "express";

import { updateLocation } from "../../helpers/licencesDB/updateLocation.js";


export const handler: RequestHandler = (req, res) => {

  const changeCount = updateLocation(req.body, req.session);

  if (changeCount) {

    return res.json({
      success: true,
      message: "Location updated successfully."
    });

  } else {

    return res.json({
      success: false,
      message: "Record Not Saved"
    });
  }
};
