import type { RequestHandler } from "express";

import * as configFns from "../../helpers/configFns";

import { getOrganization } from "../../helpers/licencesDB/getOrganization";
import { getLicence } from "../../helpers/licencesDB/getLicence";


const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");


export const handler: RequestHandler = (req, res, next) => {

  const licenceID = Number(req.params.licenceID);

  if (isNaN(licenceID)) {
    return next();
  }

  const licence = getLicence(licenceID, req.session);

  if (!licence) {
    return res.redirect(urlPrefix + "/licences/?error=licenceNotFound");
  }

  const organization = getOrganization(licence.organizationID, req.session);

  const headTitle =
    configFns.getProperty("licences.externalLicenceNumber.isPreferredID")
      ? "Licence " + licence.externalLicenceNumber
      : "Licence #" + licenceID.toString();

  return res.render("licence-view", {
    headTitle,
    licence,
    organization
  });
};
