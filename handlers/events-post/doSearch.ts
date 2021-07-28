import type { RequestHandler } from "express";

import { getEvents } from "../../helpers/licencesDB/getEvents.js";


export const handler: RequestHandler = (request, response) => {
  response.json(getEvents(request.body, request.session, {
    limit: Number.parseInt(request.body.limit, 10),
    offset: Number.parseInt(request.body.offset, 10)
  }));
};


export default handler;
