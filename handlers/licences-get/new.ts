import type { RequestHandler } from "express";

import * as configFns from "../../helpers/configFns";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";

import { getOrganization } from "../../helpers/licencesDB/getOrganization";
import { getNextExternalLicenceNumberFromRange } from "../../helpers/licencesDB/getNextExternalLicenceNumberFromRange";

import type { Organization } from "../../types/recordTypes";


export const handler: RequestHandler = (req, res) => {

  // Get organization (if set)

  const organizationID = Number(req.params.organizationID);

  let organization: Organization = null;

  if (!isNaN(organizationID)) {

    organization = getOrganization(organizationID, req.session);

    if (organization && !organization.isEligibleForLicences) {
      organization = null;
    }
  }

  // Use current date as default

  const currentDateAsString = dateTimeFns.dateToString(new Date());

  // Get next external licence number

  let externalLicenceNumber = "";

  const licenceNumberCalculationType = configFns.getProperty("licences.externalLicenceNumber.newCalculation");

  if (licenceNumberCalculationType === "range") {
    externalLicenceNumber = getNextExternalLicenceNumberFromRange().toString();
  }

  res.render("licence-edit", {
    headTitle: "Licence Create",
    isCreate: true,
    licence: {
      externalLicenceNumber,
      applicationDateString: currentDateAsString,
      municipality: configFns.getProperty("defaults.city"),
      startDateString: currentDateAsString,
      endDateString: currentDateAsString,
      startTimeString: "00:00",
      endTimeString: "00:00",
      licenceDetails: "",
      termsConditions: "",
      licenceTicketTypes: [],
      events: []
    },
    organization
  });
};
