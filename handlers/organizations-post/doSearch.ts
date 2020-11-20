import type { RequestHandler } from "express";

import { getOrganizations } from "../../helpers/licencesDB/getOrganizations";


export const handler: RequestHandler = (req, res) => {

  res.json(getOrganizations(req.body, req.session, {
    limit: 100,
    offset: 0
  }));
};
