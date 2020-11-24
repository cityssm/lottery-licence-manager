import type { RequestHandler } from "express";

import * as configFns from "../../helpers/configFns";

import { pokeEvent } from "../../helpers/licencesDB/pokeEvent";


const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");


export const handler: RequestHandler = (req, res) => {

  const licenceID = parseInt(req.params.licenceID, 10);
  const eventDate = parseInt(req.params.eventDate, 10);

  pokeEvent(licenceID, eventDate, req.session);

  res.redirect(urlPrefix + "/events/" + licenceID.toString() + "/" + eventDate.toString());
};
