import type { RequestHandler } from "express";

import * as configFns from "../../helpers/configFns";

import * as licencesDB_getOrganization from "../../helpers/licencesDB/getOrganization";
import * as licencesDB_getLicence from "../../helpers/licencesDB/getLicence";


export const handler: RequestHandler = (req, res) => {

  const licenceID = parseInt(req.params.licenceID, 10);

  const licence = licencesDB_getLicence.getLicence(licenceID, req.session);

  if (!licence) {

    return res.redirect("/licences/?error=licenceNotFound");
  }

  const organization = licencesDB_getOrganization.getOrganization(licence.organizationID, req.session);

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
