import type { RequestHandler } from "express";

import { pokeEvent } from "../../helpers/licencesDB/pokeEvent";


export const handler: RequestHandler = (req, res) => {

  const licenceID = parseInt(req.params.licenceID, 10);
  const eventDate = parseInt(req.params.eventDate, 10);

  pokeEvent(licenceID, eventDate, req.session);

  res.redirect("/events/" + licenceID.toString() + "/" + eventDate.toString());
};
