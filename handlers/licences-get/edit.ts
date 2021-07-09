import type { RequestHandler } from "express";

import * as configFunctions from "../../helpers/functions.config.js";

import { getLicence } from "../../helpers/licencesDB/getLicence.js";
import { getOrganization } from "../../helpers/licencesDB/getOrganization.js";


const urlPrefix = configFunctions.getProperty("reverseProxy.urlPrefix");


export const handler: RequestHandler = (request, response, next) => {

  const licenceID = Number(request.params.licenceID);

  if (Number.isNaN(licenceID)) {
    return next();
  }

  const licence = getLicence(licenceID, request.session);

  if (!licence) {

    return response.redirect(urlPrefix + "/licences/?error=licenceNotFound");

  } else if (!licence.canUpdate) {

    return response.redirect(urlPrefix + "/licences/" + licenceID.toString() + "/?error=accessDenied");
  }

  const organization = getOrganization(licence.organizationID, request.session);

  const feeCalculation = configFunctions.getProperty("licences.feeCalculationFn")(licence);

  const headTitle =
    configFunctions.getProperty("licences.externalLicenceNumber.isPreferredID")
      ? "Licence " + licence.externalLicenceNumber
      : "Licence #" + licenceID.toString();

  return response.render("licence-edit", {
    headTitle: headTitle + " Update",
    isCreate: false,
    licence,
    organization,
    feeCalculation
  });
};


export default handler;
