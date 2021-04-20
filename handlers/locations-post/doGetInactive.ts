import type { RequestHandler } from "express";

import { getInactiveLocations } from "../../helpers/licencesDB/getInactiveLocations.js";


export const handler: RequestHandler = (req, res) => {

  const inactiveYears = parseInt(req.body.inactiveYears, 10);

  res.json(getInactiveLocations(inactiveYears));
};


export default handler;
