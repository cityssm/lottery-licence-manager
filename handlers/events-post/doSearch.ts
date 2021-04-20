import type { RequestHandler } from "express";

import { getEvents } from "../../helpers/licencesDB/getEvents.js";


export const handler: RequestHandler = (req, res) => {
  res.json(getEvents(req.body, req.session));
};


export default handler;
