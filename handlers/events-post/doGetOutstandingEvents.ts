import type { RequestHandler } from "express";

import { getOutstandingEvents } from "../../helpers/licencesDB/getOutstandingEvents.js";


export const handler: RequestHandler = (request, response) => {

  const events = getOutstandingEvents(request.body, request.session);
  response.json(events);
};


export default handler;
