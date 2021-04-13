import type { RequestHandler } from "express";

import * as configFns from "../../helpers/configFns";

import { getEvent } from "../../helpers/licencesDB/getEvent";
import { getLicence } from "../../helpers/licencesDB/getLicence";
import { getOrganization } from "../../helpers/licencesDB/getOrganization";


const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");


export const handler: RequestHandler = (req, res, next) => {

  const licenceID = Number(req.params.licenceID);
  const eventDate = Number(req.params.eventDate);

  if (isNaN(licenceID) || isNaN(eventDate)) {
    return next();
  }

  if (!req.session.user.userProperties.canUpdate) {
    return res.redirect(urlPrefix + "/events/" + licenceID.toString() + "/" + eventDate.toString() + "/?error=accessDenied");
  }

  const eventObj = getEvent(licenceID, eventDate, req.session);

  if (!eventObj) {
    return res.redirect(urlPrefix + "/events/?error=eventNotFound");
  }

  if (!eventObj.canUpdate) {
    return res.redirect(urlPrefix + "/events/" + licenceID.toString() + "/" + eventDate.toString() + "/?error=accessDenied");
  }

  const licence = getLicence(licenceID, req.session);
  const organization = getOrganization(licence.organizationID, req.session);

  res.render("event-edit", {
    headTitle: "Event Update",
    event: eventObj,
    licence,
    organization
  });
};
