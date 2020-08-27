import type { RequestHandler } from "express";

import * as licencesDB_getInactiveLocations from "../../helpers/licencesDB/getInactiveLocations";


export const handler: RequestHandler = (req, res) => {

  const inactiveYears = parseInt(req.body.inactiveYears, 10);

  res.json(licencesDB_getInactiveLocations.getInactiveLocations(inactiveYears));
};
