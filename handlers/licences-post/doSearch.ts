import type { RequestHandler } from "express";

import { getLicences } from "../../helpers/licencesDB/getLicences.js";


export const handler: RequestHandler = (request, response) => {

  response.json(getLicences(request.body, request.session, {
    includeOrganization: true,
    limit: Number.parseInt(request.body.limit, 10),
    offset: Number.parseInt(request.body.offset, 10)
  }));
};


export default handler;
