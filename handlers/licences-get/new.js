"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const configFns = require("../../helpers/configFns");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const getOrganization_1 = require("../../helpers/licencesDB/getOrganization");
const getNextExternalLicenceNumberFromRange_1 = require("../../helpers/licencesDB/getNextExternalLicenceNumberFromRange");
const handler = (req, res) => {
    const organizationID = parseInt(req.params.organizationID, 10);
    let organization = null;
    if (organizationID) {
        organization = getOrganization_1.getOrganization(organizationID, req.session);
        if (organization && !organization.isEligibleForLicences) {
            organization = null;
        }
    }
    const currentDateAsString = dateTimeFns.dateToString(new Date());
    let externalLicenceNumber = "";
    const licenceNumberCalculationType = configFns.getProperty("licences.externalLicenceNumber.newCalculation");
    if (licenceNumberCalculationType === "range") {
        externalLicenceNumber = getNextExternalLicenceNumberFromRange_1.getNextExternalLicenceNumberFromRange().toString();
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
exports.handler = handler;
