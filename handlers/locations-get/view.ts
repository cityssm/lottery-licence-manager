import type { RequestHandler } from "express";

import * as configFns from "../../helpers/configFns";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";

import { getLicences } from "../../helpers/licencesDB/getLicences";
import { getLocation } from "../../helpers/licencesDB/getLocation";


const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");


export const handler: RequestHandler = (req, res, next) => {

  const locationID = Number(req.params.locationID);

  if (isNaN(locationID)) {
    return next();
  }

  const location = getLocation(locationID, req.session);

  if (!location) {
    return res.redirect(urlPrefix + "/locations/?error=locationNotFound");
  }

  const licences = getLicences({
    locationID
  }, req.session, {
      includeOrganization: true,
      limit: -1
    }).licences;

  return res.render("location-view", {
    headTitle: location.locationDisplayName,
    location,
    licences,
    currentDateInteger: dateTimeFns.dateToInteger(new Date())
  });
};
