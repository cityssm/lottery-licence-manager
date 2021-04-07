"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const path = require("path");
const ejs = require("ejs");
const configFns = require("../../helpers/configFns");
const licencesDB_getOrganization = require("../../helpers/licencesDB/getOrganization");
const licencesDB_getLicence = require("../../helpers/licencesDB/getLicence");
const convertHTMLToPDF = require("pdf-puppeteer");
const handler = async (req, res, next) => {
    const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");
    const licenceID = parseInt(req.params.licenceID, 10);
    const licence = licencesDB_getLicence.getLicence(licenceID, req.session);
    if (!licence) {
        res.redirect(urlPrefix + "/licences/?error=licenceNotFound");
        return;
    }
    if (!licence.issueDate) {
        res.redirect(urlPrefix + "/licences/?error=licenceNotIssued");
        return;
    }
    const organization = licencesDB_getOrganization.getOrganization(licence.organizationID, req.session);
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
            format: "Letter",
            printBackground: true,
            preferCSSPageSize: true
        });
        return null;
    });
};
exports.handler = handler;
