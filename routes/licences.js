"use strict";
const express_1 = require("express");
const path = require("path");
const ejs = require("ejs");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const configFns = require("../helpers/configFns");
const licencesDB = require("../helpers/licencesDB");
const licencesDBOrganizations = require("../helpers/licencesDB-organizations");
const convertHTMLToPDF = require("pdf-puppeteer");
const router = express_1.Router();
router.get("/", (_req, res) => {
    res.render("licence-search", {
        headTitle: "Lottery Licences"
    });
});
router.post("/doSearch", (req, res) => {
    res.json(licencesDB.getLicences(req.body, req.session, {
        includeOrganization: true,
        limit: req.body.limit,
        offset: req.body.offset
    }));
});
router.get("/licenceTypes", (_req, res) => {
    const licenceTableStats = licencesDB.getLicenceTableStats();
    const applicationDate = new Date();
    applicationDate.setMonth(applicationDate.getMonth() - 1);
    applicationDate.setDate(1);
    const applicationDateStartString = dateTimeFns.dateToString(applicationDate);
    applicationDate.setMonth(applicationDate.getMonth() + 1);
    applicationDate.setDate(0);
    const applicationDateEndString = dateTimeFns.dateToString(applicationDate);
    res.render("licence-licenceType", {
        headTitle: "Licence Type Summary",
        applicationYearMin: (licenceTableStats.applicationYearMin || new Date().getFullYear()),
        applicationDateStartString,
        applicationDateEndString
    });
});
router.post("/doGetLicenceTypeSummary", (req, res) => {
    res.json(licencesDB.getLicenceTypeSummary(req.body));
});
router.get("/activeSummary", (_req, res) => {
    const licenceTableStats = licencesDB.getLicenceTableStats();
    const startDate = new Date();
    startDate.setDate(1);
    const startDateStartString = dateTimeFns.dateToString(startDate);
    startDate.setMonth(startDate.getMonth() + 1);
    startDate.setDate(0);
    const startDateEndString = dateTimeFns.dateToString(startDate);
    res.render("licence-activeSummary", {
        headTitle: "Active Licence Summary",
        startYearMin: (licenceTableStats.startYearMin || new Date().getFullYear()),
        startDateStartString,
        startDateEndString
    });
});
router.post("/doGetActiveLicenceSummary", (req, res) => {
    res.json(licencesDB.getActiveLicenceSummary(req.body, req.session));
});
router.get([
    "/new",
    "/new/:organizationID"
], (req, res) => {
    if (!req.session.user.userProperties.canCreate) {
        res.redirect("/licences/?error=accessDenied");
        return;
    }
    const organizationID = parseInt(req.params.organizationID, 10);
    let organization = null;
    if (organizationID) {
        organization = licencesDBOrganizations.getOrganization(organizationID, req.session);
        if (organization && !organization.isEligibleForLicences) {
            organization = null;
        }
    }
    const currentDateAsString = dateTimeFns.dateToString(new Date());
    let externalLicenceNumber = "";
    const licenceNumberCalculationType = configFns.getProperty("licences.externalLicenceNumber.newCalculation");
    if (licenceNumberCalculationType === "range") {
        externalLicenceNumber = licencesDB.getNextExternalLicenceNumberFromRange().toString();
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
});
router.post("/doGetDistinctTermsConditions", (req, res) => {
    const organizationID = req.body.organizationID;
    res.json(licencesDB.getDistinctTermsConditions(organizationID));
});
router.post("/doGetTicketTypes", (req, res) => {
    const licenceTypeKey = req.body.licenceTypeKey;
    const licenceType = configFns.getLicenceType(licenceTypeKey);
    if (licenceType) {
        res.json(licenceType.ticketTypes || []);
    }
    else {
        res.json([]);
    }
});
router.post("/doSave", (req, res) => {
    if (!req.session.user.userProperties.canCreate) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    if (req.body.licenceID === "") {
        const newLicenceID = licencesDB.createLicence(req.body, req.session);
        res.json({
            success: true,
            licenceID: newLicenceID
        });
    }
    else {
        const changeCount = licencesDB.updateLicence(req.body, req.session);
        if (changeCount) {
            res.json({
                success: true,
                message: "Licence updated successfully."
            });
        }
        else {
            res.json({
                success: false,
                message: "Record Not Saved"
            });
        }
    }
});
router.post("/doAddTransaction", (req, res) => {
    if (!req.session.user.userProperties.canCreate) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    const newTransactionIndex = licencesDB.addTransaction(req.body, req.session);
    res.json({
        success: true,
        message: "Transaction Added Successfully",
        transactionIndex: newTransactionIndex
    });
});
router.post("/doVoidTransaction", (req, res) => {
    if (!req.session.user.userProperties.canCreate) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    const success = licencesDB.voidTransaction(req.body.licenceID, req.body.transactionIndex, req.session);
    if (success) {
        res.json({
            success: true,
            message: "Transaction Voided Successfully"
        });
    }
    else {
        res.json({
            success: false,
            message: "Transaction Not Voided"
        });
    }
});
router.post("/doIssueLicence", (req, res) => {
    if (!req.session.user.userProperties.canCreate) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    const success = licencesDB.issueLicence(req.body.licenceID, req.session);
    if (success) {
        res.json({
            success: true,
            message: "Licence Issued Successfully"
        });
    }
    else {
        res.json({
            success: false,
            message: "Licence Not Issued"
        });
    }
});
router.post("/doUnissueLicence", (req, res) => {
    if (!req.session.user.userProperties.canCreate) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    const success = licencesDB.unissueLicence(req.body.licenceID, req.session);
    if (success) {
        res.json({
            success: true,
            message: "Licence Unissued Successfully"
        });
    }
    else {
        res.json({
            success: false,
            message: "Licence Not Unissued"
        });
    }
});
router.post("/doDelete", (req, res) => {
    if (!req.session.user.userProperties.canCreate) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    if (req.body.licenceID === "") {
        res.json({
            success: false,
            message: "Licence ID Unavailable"
        });
    }
    else {
        const changeCount = licencesDB.deleteLicence(req.body.licenceID, req.session);
        if (changeCount) {
            res.json({
                success: true,
                message: "Licence Deleted"
            });
        }
        else {
            res.json({
                success: false,
                message: "Licence Not Deleted"
            });
        }
    }
});
router.get("/:licenceID", (req, res) => {
    const licenceID = parseInt(req.params.licenceID, 10);
    const licence = licencesDB.getLicence(licenceID, req.session);
    if (!licence) {
        res.redirect("/licences/?error=licenceNotFound");
        return;
    }
    const organization = licencesDBOrganizations.getOrganization(licence.organizationID, req.session);
    const headTitle = configFns.getProperty("licences.externalLicenceNumber.isPreferredID")
        ? "Licence " + licence.externalLicenceNumber
        : "Licence #" + licenceID.toString();
    res.render("licence-view", {
        headTitle,
        licence,
        organization
    });
});
router.get("/:licenceID/edit", (req, res) => {
    const licenceID = parseInt(req.params.licenceID, 10);
    if (!req.session.user.userProperties.canCreate) {
        res.redirect("/licences/" + licenceID.toString() + "/?error=accessDenied");
        return;
    }
    const licence = licencesDB.getLicence(licenceID, req.session);
    if (!licence) {
        res.redirect("/licences/?error=licenceNotFound");
        return;
    }
    else if (!licence.canUpdate) {
        res.redirect("/licences/" + licenceID.toString() + "/?error=accessDenied");
        return;
    }
    const organization = licencesDBOrganizations.getOrganization(licence.organizationID, req.session);
    const feeCalculation = configFns.getProperty("licences.feeCalculationFn")(licence);
    res.render("licence-edit", {
        headTitle: "Licence #" + licenceID.toString() + " Update",
        isCreate: false,
        licence,
        organization,
        feeCalculation
    });
});
router.get("/:licenceID/print", (req, res, next) => {
    const licenceID = parseInt(req.params.licenceID, 10);
    const licence = licencesDB.getLicence(licenceID, req.session);
    if (!licence) {
        res.redirect("/licences/?error=licenceNotFound");
        return;
    }
    if (!licence.issueDate) {
        res.redirect("/licences/?error=licenceNotIssued");
        return;
    }
    const organization = licencesDBOrganizations.getOrganization(licence.organizationID, req.session);
    ejs.renderFile(path.join(__dirname, "../reports/", configFns.getProperty("licences.printTemplate")), {
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
});
router.get("/:licenceID/poke", (req, res) => {
    const licenceID = parseInt(req.params.licenceID, 10);
    if (req.session.user.userProperties.isAdmin) {
        licencesDB.pokeLicence(licenceID, req.session);
    }
    res.redirect("/licences/" + licenceID.toString());
});
module.exports = router;
