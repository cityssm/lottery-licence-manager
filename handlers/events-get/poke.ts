import type { RequestHandler } from "express";

import * as configFns from "../../helpers/configFns.js";

import { pokeEvent } from "../../helpers/licencesDB/pokeEvent.js";


const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");


export const handler: RequestHandler = (req, res, next) => {

  const licenceID = Number(req.params.licenceID);
  const eventDate = Number(req.params.eventDate);

  if (isNaN(licenceID) || isNaN(eventDate)) {
    return next();
  }

  pokeEvent(licenceID, eventDate, req.session);

  res.redirect(urlPrefix + "/events/" + licenceID.toString() + "/" + eventDate.toString());
};
