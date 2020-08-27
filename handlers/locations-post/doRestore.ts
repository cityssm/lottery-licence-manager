import type { RequestHandler } from "express";

import * as licencesDB_restoreLocation from "../../helpers/licencesDB/restoreLocation";


export const handler: RequestHandler = (req, res) => {

  const changeCount = licencesDB_restoreLocation.restoreLocation(req.body.locationID, req.session);

  if (changeCount) {

    return res.json({
      success: true,
      message: "Location restored successfully."
    });

  } else {

    return res.json({
      success: false,
      message: "Location could not be restored."
    });
  }
};
