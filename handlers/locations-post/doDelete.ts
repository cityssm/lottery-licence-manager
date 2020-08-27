import type { RequestHandler } from "express";

import * as licencesDB_deleteLocation from "../../helpers/licencesDB/deleteLocation";


export const handler: RequestHandler = (req, res) => {

  const changeCount = licencesDB_deleteLocation.deleteLocation(req.body.locationID, req.session);

  if (changeCount) {

    return res.json({
      success: true,
      message: "Location deleted successfully."
    });

  } else {

    return res.json({
      success: false,
      message: "Location could not be deleted."
    });
  }
};
