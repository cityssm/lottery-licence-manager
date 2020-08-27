import type { RequestHandler } from "express";

import * as configFns from "../../helpers/configFns";

import * as licencesDB_getOrganization from "../../helpers/licencesDB/getOrganization";
import * as licencesDB_getLicence from "../../helpers/licencesDB/getLicence";


export const handler: RequestHandler = (req, res) => {

  const licenceID = parseInt(req.params.licenceID, 10);

  if (!req.session.user.userProperties.canCreate) {

    res.redirect("/licences/" + licenceID.toString() + "/?error=accessDenied");
    return;

  }

  const licence = licencesDB_getLicence.getLicence(licenceID, req.session);

  if (!licence) {

    res.redirect("/licences/?error=licenceNotFound");
    return;

  } else if (!licence.canUpdate) {

    res.redirect("/licences/" + licenceID.toString() + "/?error=accessDenied");
    return;

  }


  const organization = licencesDB_getOrganization.getOrganization(licence.organizationID, req.session);

  const feeCalculation = configFns.getProperty("licences.feeCalculationFn")(licence);

  res.render("licence-edit", {
    headTitle: "Licence #" + licenceID.toString() + " Update",
    isCreate: false,
    licence,
    organization,
    feeCalculation
  });
};
