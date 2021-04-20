import type { RequestHandler } from "express";

import * as configFns from "../../helpers/configFns.js";

import { getEvent } from "../../helpers/licencesDB/getEvent.js";
import { getLicence } from "../../helpers/licencesDB/getLicence.js";
import { getOrganization } from "../../helpers/licencesDB/getOrganization.js";


const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");


export const handler: RequestHandler = (req, res, next) => {

  const licenceID = Number(req.params.licenceID);
  const eventDate = Number(req.params.eventDate);

  if (isNaN(licenceID) || isNaN(eventDate)) {
    return next();
  }

  const eventObj = getEvent(licenceID, eventDate, req.session);

  if (!eventObj) {
    return res.redirect(urlPrefix + "/events/?error=eventNotFound");
  }

  const licence = getLicence(licenceID, req.session);
  const organization = getOrganization(licence.organizationID, req.session);

  res.render("event-view", {
    headTitle: "Event View",
    event: eventObj,
    licence,
    organization
  });
};


export default handler;
