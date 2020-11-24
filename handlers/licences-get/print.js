"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const path = require("path");
const ejs = require("ejs");
const configFns = require("../../helpers/configFns");
const licencesDB_getOrganization = require("../../helpers/licencesDB/getOrganization");
const licencesDB_getLicence = require("../../helpers/licencesDB/getLicence");
const convertHTMLToPDF = require("pdf-puppeteer");
const handler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
    yield ejs.renderFile(path.join(__dirname, "../../reports/", configFns.getProperty("licences.printTemplate")), {
        configFns,
        licence,
        organization
    }, {}, (ejsErr, ejsData) => __awaiter(void 0, void 0, void 0, function* () {
        if (ejsErr) {
            return next(ejsErr);
        }
        const pdfCallbackFn = (pdf) => {
            res.setHeader("Content-Disposition", "attachment;" +
                " filename=licence-" + licenceID.toString() + "-" + licence.recordUpdate_timeMillis.toString() + ".pdf");
            res.setHeader("Content-Type", "application/pdf");
            res.send(pdf);
        };
        yield convertHTMLToPDF(ejsData, pdfCallbackFn, {
            format: "Letter",
            printBackground: true,
            preferCSSPageSize: true
        });
        return null;
    }));
});
exports.handler = handler;
