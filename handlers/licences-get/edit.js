"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const configFns = require("../../helpers/configFns");
const getLicence_1 = require("../../helpers/licencesDB/getLicence");
const getOrganization_1 = require("../../helpers/licencesDB/getOrganization");
const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");
const handler = (req, res, next) => {
    const licenceID = Number(req.params.licenceID);
    if (isNaN(licenceID)) {
        return next();
    }
    const licence = getLicence_1.getLicence(licenceID, req.session);
    if (!licence) {
        return res.redirect(urlPrefix + "/licences/?error=licenceNotFound");
    }
    else if (!licence.canUpdate) {
        return res.redirect(urlPrefix + "/licences/" + licenceID.toString() + "/?error=accessDenied");
    }
    const organization = getOrganization_1.getOrganization(licence.organizationID, req.session);
    const feeCalculation = configFns.getProperty("licences.feeCalculationFn")(licence);
    return res.render("licence-edit", {
        headTitle: "Licence #" + licenceID.toString() + " Update",
        isCreate: false,
        licence,
        organization,
        feeCalculation
    });
};
exports.handler = handler;
