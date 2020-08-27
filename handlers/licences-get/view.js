"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const configFns = require("../../helpers/configFns");
const licencesDB_getOrganization = require("../../helpers/licencesDB/getOrganization");
const licencesDB_getLicence = require("../../helpers/licencesDB/getLicence");
exports.handler = (req, res) => {
    const licenceID = parseInt(req.params.licenceID, 10);
    const licence = licencesDB_getLicence.getLicence(licenceID, req.session);
    if (!licence) {
        return res.redirect("/licences/?error=licenceNotFound");
    }
    const organization = licencesDB_getOrganization.getOrganization(licence.organizationID, req.session);
    const headTitle = configFns.getProperty("licences.externalLicenceNumber.isPreferredID")
        ? "Licence " + licence.externalLicenceNumber
        : "Licence #" + licenceID.toString();
    return res.render("licence-view", {
        headTitle,
        licence,
        organization
    });
};
