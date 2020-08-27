import type { RequestHandler } from "express";

import * as licencesDB_getEvent from "../../helpers/licencesDB/getEvent";
import * as licencesDB_getLicence from "../../helpers/licencesDB/getLicence";
import * as licencesDB_getOrganization from "../../helpers/licencesDB/getOrganization";


export const handler: RequestHandler = (req, res) => {

  const licenceID = parseInt(req.params.licenceID, 10);
  const eventDate = parseInt(req.params.eventDate, 10);

  if (!req.session.user.userProperties.canUpdate) {

    res.redirect("/events/" + licenceID.toString() + "/" + eventDate.toString() + "/?error=accessDenied");
    return;

  }

  const eventObj = licencesDB_getEvent.getEvent(licenceID, eventDate, req.session);

  if (!eventObj) {

    res.redirect("/events/?error=eventNotFound");
    return;

  }

  if (!eventObj.canUpdate) {

    res.redirect("/events/" + licenceID.toString() + "/" + eventDate.toString() + "/?error=accessDenied");
    return;

  }

  const licence = licencesDB_getLicence.getLicence(licenceID, req.session);
  const organization = licencesDB_getOrganization.getOrganization(licence.organizationID, req.session);

  res.render("event-edit", {
    headTitle: "Event Update",
    event: eventObj,
    licence,
    organization
  });
};
