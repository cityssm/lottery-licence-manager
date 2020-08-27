import type { RequestHandler } from "express";

import * as licencesDB_updateLocation from "../../helpers/licencesDB/updateLocation";


export const handler: RequestHandler = (req, res) => {

  const changeCount = licencesDB_updateLocation.updateLocation(req.body, req.session);

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
