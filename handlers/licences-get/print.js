"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const path = require("path");
const ejs = require("ejs");
const configFns = require("../../helpers/configFns");
const licencesDB_getOrganization = require("../../helpers/licencesDB/getOrganization");
const licencesDB_getLicence = require("../../helpers/licencesDB/getLicence");
const convertHTMLToPDF = require("pdf-puppeteer");
exports.handler = (req, res, next) => {
    const licenceID = parseInt(req.params.licenceID, 10);
    const licence = licencesDB_getLicence.getLicence(licenceID, req.session);
    if (!licence) {
        res.redirect("/licences/?error=licenceNotFound");
        return;
    }
    if (!licence.issueDate) {
        res.redirect("/licences/?error=licenceNotIssued");
        return;
    }
    const organization = licencesDB_getOrganization.getOrganization(licence.organizationID, req.session);
    ejs.renderFile(path.join(__dirname, "../../reports/", configFns.getProperty("licences.printTemplate")), {
        configFns,
        licence,
        organization
    }, {}, (ejsErr, ejsData) => {
        if (ejsErr) {
            return next(ejsErr);
        }
        convertHTMLToPDF(ejsData, (pdf) => {
            res.setHeader("Content-Disposition", "attachment;" +
                " filename=licence-" + licenceID.toString() + "-" + licence.recordUpdate_timeMillis.toString() + ".pdf");
            res.setHeader("Content-Type", "application/pdf");
            res.send(pdf);
        }, {
            format: "Letter",
            printBackground: true,
            preferCSSPageSize: true
        });
        return null;
    });
};
