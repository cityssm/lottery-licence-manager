import type { RequestHandler } from "express";

import { getOrganizations } from "../../helpers/licencesDB/getOrganizations.js";


export const handler: RequestHandler = (request, response) => {

  response.json(getOrganizations({}, request.session, {
    limit: -1
  }));
};


export default handler;
