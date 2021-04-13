import type { RequestHandler } from "express";

import * as configFns from "../../helpers/configFns";

import { getLicence } from "../../helpers/licencesDB/getLicence";
import { getOrganization } from "../../helpers/licencesDB/getOrganization";


const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");


export const handler: RequestHandler = (req, res, next) => {

  const licenceID = Number(req.params.licenceID);

  if (isNaN(licenceID)) {
    return next();
  }

  const licence = getLicence(licenceID, req.session);

  if (!licence) {

    return res.redirect(urlPrefix + "/licences/?error=licenceNotFound");

  } else if (!licence.canUpdate) {

    return res.redirect(urlPrefix + "/licences/" + licenceID.toString() + "/?error=accessDenied");
  }

  const organization = getOrganization(licence.organizationID, req.session);

  const feeCalculation = configFns.getProperty("licences.feeCalculationFn")(licence);

  return res.render("licence-edit", {
    headTitle: "Licence #" + licenceID.toString() + " Update",
    isCreate: false,
    licence,
    organization,
    feeCalculation
  });
};
