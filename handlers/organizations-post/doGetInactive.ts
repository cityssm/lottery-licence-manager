import type { RequestHandler } from "express";

import { getInactiveOrganizations } from "../../helpers/licencesDB/getInactiveOrganizations.js";


export const handler: RequestHandler = (req, res) => {

  const inactiveYears = parseInt(req.body.inactiveYears, 10);

  res.json(getInactiveOrganizations(inactiveYears));
};
