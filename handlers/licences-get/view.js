"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const configFns = require("../../helpers/configFns");
const getOrganization_1 = require("../../helpers/licencesDB/getOrganization");
const getLicence_1 = require("../../helpers/licencesDB/getLicence");
const handler = (req, res) => {
    const licenceID = parseInt(req.params.licenceID, 10);
    const licence = getLicence_1.getLicence(licenceID, req.session);
    if (!licence) {
        return res.redirect("/licences/?error=licenceNotFound");
    }
    const organization = getOrganization_1.getOrganization(licence.organizationID, req.session);
    const headTitle = configFns.getProperty("licences.externalLicenceNumber.isPreferredID")
        ? "Licence " + licence.externalLicenceNumber
        : "Licence #" + licenceID.toString();
    return res.render("licence-view", {
        headTitle,
        licence,
        organization
    });
};
exports.handler = handler;
