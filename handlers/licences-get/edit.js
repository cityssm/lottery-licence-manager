"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const configFns = require("../../helpers/configFns");
const getLicence_1 = require("../../helpers/licencesDB/getLicence");
const getOrganization_1 = require("../../helpers/licencesDB/getOrganization");
const handler = (req, res) => {
    const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");
    const licenceID = parseInt(req.params.licenceID, 10);
    const licence = getLicence_1.getLicence(licenceID, req.session);
    if (!licence) {
        res.redirect(urlPrefix + "/licences/?error=licenceNotFound");
        return;
    }
    else if (!licence.canUpdate) {
        res.redirect(urlPrefix + "/licences/" + licenceID.toString() + "/?error=accessDenied");
        return;
    }
    const organization = getOrganization_1.getOrganization(licence.organizationID, req.session);
    const feeCalculation = configFns.getProperty("licences.feeCalculationFn")(licence);
    res.render("licence-edit", {
        headTitle: "Licence #" + licenceID.toString() + " Update",
        isCreate: false,
        licence,
        organization,
        feeCalculation
    });
};
exports.handler = handler;
