import type { RequestHandler } from "express";

import * as licencesDB_createLocation from "../../helpers/licencesDB/createLocation";


export const handler: RequestHandler = (req, res) => {

  const locationID = licencesDB_createLocation.createLocation(req.body, req.session);

  return res.json({
    success: true,
    locationID,
    locationDisplayName: (req.body.locationName === "" ? req.body.locationAddress1 : req.body.locationName)
  });
};
