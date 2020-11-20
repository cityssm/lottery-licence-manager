import type { RequestHandler } from "express";

import { createLocation } from "../../helpers/licencesDB/createLocation";


export const handler: RequestHandler = (req, res) => {

  const locationID = createLocation(req.body, req.session);

  return res.json({
    success: true,
    locationID,
    locationDisplayName: (req.body.locationName === "" ? req.body.locationAddress1 : req.body.locationName)
  });
};
