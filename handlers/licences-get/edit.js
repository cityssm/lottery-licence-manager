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
        res.redirect("/licences/?error=licenceNotFound");
        return;
    }
    else if (!licence.canUpdate) {
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
