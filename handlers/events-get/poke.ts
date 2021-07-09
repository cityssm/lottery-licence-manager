import type { RequestHandler } from "express";

import * as configFunctions from "../../helpers/functions.config.js";

import { pokeEvent } from "../../helpers/licencesDB/pokeEvent.js";


const urlPrefix = configFunctions.getProperty("reverseProxy.urlPrefix");


export const handler: RequestHandler = (request, response, next) => {

  const licenceID = Number(request.params.licenceID);
  const eventDate = Number(request.params.eventDate);

  if (Number.isNaN(licenceID) || Number.isNaN(eventDate)) {
    return next();
  }

  pokeEvent(licenceID, eventDate, request.session);

  response.redirect(urlPrefix + "/events/" + licenceID.toString() + "/" + eventDate.toString());
};


export default handler;
