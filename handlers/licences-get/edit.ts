import type { RequestHandler } from "express";

import * as configFns from "../../helpers/configFns";

import { getLicence } from "../../helpers/licencesDB/getLicence";
import { getOrganization } from "../../helpers/licencesDB/getOrganization";


export const handler: RequestHandler = (req, res) => {

  const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");

  const licenceID = parseInt(req.params.licenceID, 10);

  const licence = getLicence(licenceID, req.session);

  if (!licence) {

    res.redirect(urlPrefix + "/licences/?error=licenceNotFound");
    return;

  } else if (!licence.canUpdate) {

    res.redirect(urlPrefix + "/licences/" + licenceID.toString() + "/?error=accessDenied");
    return;

  }


  const organization = getOrganization(licence.organizationID, req.session);

  const feeCalculation = configFns.getProperty("licences.feeCalculationFn")(licence);

  res.render("licence-edit", {
    headTitle: "Licence #" + licenceID.toString() + " Update",
    isCreate: false,
    licence,
    organization,
    feeCalculation
  });
};
