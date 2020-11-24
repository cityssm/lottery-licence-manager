import type { RequestHandler } from "express";

import * as configFns from "../../helpers/configFns";

import { getEvent } from "../../helpers/licencesDB/getEvent";
import { getLicence } from "../../helpers/licencesDB/getLicence";
import { getOrganization } from "../../helpers/licencesDB/getOrganization";


export const handler: RequestHandler = (req, res) => {

  const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");

  const licenceID = parseInt(req.params.licenceID, 10);
  const eventDate = parseInt(req.params.eventDate, 10);

  if (!req.session.user.userProperties.canUpdate) {

    res.redirect(urlPrefix + "/events/" + licenceID.toString() + "/" + eventDate.toString() + "/?error=accessDenied");
    return;

  }

  const eventObj = getEvent(licenceID, eventDate, req.session);

  if (!eventObj) {

    res.redirect(urlPrefix + "/events/?error=eventNotFound");
    return;

  }

  if (!eventObj.canUpdate) {

    res.redirect(urlPrefix + "/events/" + licenceID.toString() + "/" + eventDate.toString() + "/?error=accessDenied");
    return;

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
