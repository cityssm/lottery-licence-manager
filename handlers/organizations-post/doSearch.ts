import type { RequestHandler } from "express";

import { getOrganizations } from "../../helpers/licencesDB/getOrganizations.js";


export const handler: RequestHandler = (request, response) => {

  response.json(getOrganizations(request.body, request.session, {
    limit: 100,
    offset: 0
  }));
};


export default handler;
