import type { RequestHandler } from "express";

import * as licencesDB_getLicences from "../../helpers/licencesDB/getLicences";


export const handler: RequestHandler = (req, res) => {

  res.json(licencesDB_getLicences.getLicences(req.body, req.session, {
    includeOrganization: true,
    limit: req.body.limit,
    offset: req.body.offset
  }));
};
