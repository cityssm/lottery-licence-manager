import type { RequestHandler } from "express";

import * as configFns from "../../helpers/configFns.js";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";

import { getLicences } from "../../helpers/licencesDB/getLicences.js";
import { getLocation } from "../../helpers/licencesDB/getLocation.js";


const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");


export const handler: RequestHandler = (request, response, next) => {

  const locationID = Number(request.params.locationID);

  if (Number.isNaN(locationID)) {
    return next();
  }

  const location = getLocation(locationID, request.session);

  if (!location) {
    return response.redirect(urlPrefix + "/locations/?error=locationNotFound");
  }

  const licences = getLicences({
    locationID
  }, request.session, {
      includeOrganization: true,
      limit: -1
    }).licences;

  return response.render("location-view", {
    headTitle: location.locationDisplayName,
    location,
    licences,
    currentDateInteger: dateTimeFns.dateToInteger(new Date())
  });
};


export default handler;
