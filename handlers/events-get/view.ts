import type { RequestHandler } from "express";

import * as configFns from "../../helpers/configFns";

import { getEvent } from "../../helpers/licencesDB/getEvent";
import { getLicence } from "../../helpers/licencesDB/getLicence";
import { getOrganization } from "../../helpers/licencesDB/getOrganization";


export const handler: RequestHandler = (req, res) => {

  const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");

  const licenceID = parseInt(req.params.licenceID, 10);
  const eventDate = parseInt(req.params.eventDate, 10);

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
