import type { RequestHandler } from "express";

import { getEvents } from "../../helpers/licencesDB/getEvents.js";


export const handler: RequestHandler = (request, response) => {
  response.json(getEvents(request.body, request.session));
};


export default handler;
