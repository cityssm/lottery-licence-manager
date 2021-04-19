import type { RequestHandler } from "express";

import { getOutstandingEvents } from "../../helpers/licencesDB/getOutstandingEvents.js";


export const handler: RequestHandler = (req, res) => {

  const events = getOutstandingEvents(req.body, req.session);
  res.json(events);
};
