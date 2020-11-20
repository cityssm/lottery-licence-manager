import type { RequestHandler } from "express";

import { getOrganizations } from "../../helpers/licencesDB/getOrganizations";


export const handler: RequestHandler = (req, res) => {

  res.json(getOrganizations({}, req.session, {
    limit: -1
  }));
};
