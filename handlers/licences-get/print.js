"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const path = require("path");
const ejs = require("ejs");
const configFns = require("../../helpers/configFns");
const getOrganization_1 = require("../../helpers/licencesDB/getOrganization");
const getLicence_1 = require("../../helpers/licencesDB/getLicence");
const convertHTMLToPDF = require("pdf-puppeteer");
const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");
const handler = async (req, res, next) => {
    const licenceID = Number(req.params.licenceID);
    if (isNaN(licenceID)) {
        return next();
    }
    const licence = getLicence_1.getLicence(licenceID, req.session);
    if (!licence) {
        return res.redirect(urlPrefix + "/licences/?error=licenceNotFound");
    }
    if (!licence.issueDate) {
        return res.redirect(urlPrefix + "/licences/?error=licenceNotIssued");
    }
    const organization = getOrganization_1.getOrganization(licence.organizationID, req.session);
    await ejs.renderFile(path.join(__dirname, "../../reports/", configFns.getProperty("licences.printTemplate")), {
        configFns,
        licence,
        organization
    }, {}, async (ejsErr, ejsData) => {
        if (ejsErr) {
            return next(ejsErr);
        }
        const pdfCallbackFn = (pdf) => {
            res.setHeader("Content-Disposition", "attachment;" +
                " filename=licence-" + licenceID.toString() + "-" + licence.recordUpdate_timeMillis.toString() + ".pdf");
            res.setHeader("Content-Type", "application/pdf");
            res.send(pdf);
        };
        await convertHTMLToPDF(ejsData, pdfCallbackFn, {
            format: "letter",
            printBackground: true,
            preferCSSPageSize: true
        });
        return null;
    });
};
exports.handler = handler;
