import type { RequestHandler } from "express";

import { getEvents } from "../../helpers/licencesDB/getEvents";


export const handler: RequestHandler = (req, res) => {
  res.json(getEvents(req.body, req.session));
};
