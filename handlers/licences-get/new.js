import * as configFns from "../../helpers/configFns.js";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import { getOrganization } from "../../helpers/licencesDB/getOrganization.js";
import { getNextExternalLicenceNumberFromRange } from "../../helpers/licencesDB/getNextExternalLicenceNumberFromRange.js";
export const handler = (req, res) => {
    const organizationID = Number(req.params.organizationID);
    let organization = null;
    if (!isNaN(organizationID)) {
        organization = getOrganization(organizationID, req.session);
        if (organization && !organization.isEligibleForLicences) {
            organization = null;
        }
    }
    const currentDateAsString = dateTimeFns.dateToString(new Date());
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
