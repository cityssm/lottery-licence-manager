import type { RequestHandler } from "express";

import { getOrganizations } from "../../helpers/licencesDB/getOrganizations.js";


export const handler: RequestHandler = (req, res) => {

  res.json(getOrganizations({}, req.session, {
    limit: -1
  }));
};


export default handler;
