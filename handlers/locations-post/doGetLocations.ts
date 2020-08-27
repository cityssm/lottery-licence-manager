import type { RequestHandler } from "express";

import * as licencesDB_getLocations from "../../helpers/licencesDB/getLocations";


export const handler: RequestHandler = (req, res) => {

  const locations = licencesDB_getLocations.getLocations(req.session, {
    limit: req.body.limit || -1,
    offset: req.body.offset || 0,
    locationNameAddress: req.body.locationNameAddress,
    locationIsDistributor: ("locationIsDistributor" in req.body && req.body.locationIsDistributor !== ""
      ? parseInt(req.body.locationIsDistributor, 10)
      : -1),
    locationIsManufacturer: ("locationIsManufacturer" in req.body && req.body.locationIsManufacturer !== ""
      ? parseInt(req.body.locationIsManufacturer, 10)
      : -1),
    locationIsActive: req.body.locationIsActive || ""
  });

  res.json(locations);
};