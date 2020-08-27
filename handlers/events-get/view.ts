import type { RequestHandler } from "express";

import * as licencesDB_getEvent from "../../helpers/licencesDB/getEvent";
import * as licencesDB_getLicence from "../../helpers/licencesDB/getLicence";
import * as licencesDB_getOrganization from "../../helpers/licencesDB/getOrganization";


export const handler: RequestHandler = (req, res) => {

  const licenceID = parseInt(req.params.licenceID, 10);
  const eventDate = parseInt(req.params.eventDate, 10);

  const eventObj = licencesDB_getEvent.getEvent(licenceID, eventDate, req.session);

  if (!eventObj) {

    return res.redirect("/events/?error=eventNotFound");
  }

  const licence = licencesDB_getLicence.getLicence(licenceID, req.session);
  const organization = licencesDB_getOrganization.getOrganization(licence.organizationID, req.session);

  res.render("event-view", {
    headTitle: "Event View",
    event: eventObj,
    licence,
    organization
  });
};
