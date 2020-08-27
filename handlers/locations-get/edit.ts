import type { RequestHandler } from "express";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";

import * as licencesDB_getLicences from "../../helpers/licencesDB/getLicences";
import * as licencesDB_getLocation from "../../helpers/licencesDB/getLocation";


export const handler: RequestHandler = (req, res) => {

  const locationID = parseInt(req.params.locationID, 10);

  const location = licencesDB_getLocation.getLocation(locationID, req.session);

  if (!location) {

    res.redirect("/locations/?error=locationNotFound");
    return;

  }

  if (!location.canUpdate) {

    res.redirect("/locations/" + locationID.toString() + "/?error=accessDenied-noUpdate");
    return;

  }

  const licences = licencesDB_getLicences.getLicences({
    locationID
  }, req.session, {
      includeOrganization: true,
      limit: -1
    }).licences;

  res.render("location-edit", {
    headTitle: location.locationDisplayName,
    location,
    licences,
    currentDateInteger: dateTimeFns.dateToInteger(new Date()),
    isCreate: false
  });
};
