import type { RequestHandler } from "express";

import * as licencesDB_getOrganizations from "../../helpers/licencesDB/getOrganizations";


export const handler: RequestHandler = (req, res) => {

  res.json(licencesDB_getOrganizations.getOrganizations({}, req.session, {
    limit: -1
  }));
};
