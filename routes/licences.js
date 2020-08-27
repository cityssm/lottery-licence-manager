"use strict";
const express_1 = require("express");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const configFns = require("../helpers/configFns");
const permissionHandlers = require("../handlers/permissions");
const handler_doSearch = require("../handlers/licences-post/doSearch");
const handler_view = require("../handlers/licences-get/view");
const handler_new = require("../handlers/licences-get/new");
const handler_edit = require("../handlers/licences-get/edit");
const handler_print = require("../handlers/licences-get/print");
const handler_poke = require("../handlers/licences-get/poke");
const handler_doSave = require("../handlers/licences-post/doSave");
const handler_doIssueLicence = require("../handlers/licences-post/doIssueLicence");
const handler_doUnissueLicence = require("../handlers/licences-post/doUnissueLicence");
const handler_doDelete = require("../handlers/licences-post/doDelete");
const handler_doAddTransaction = require("../handlers/licences-post/doAddTransaction");
const handler_doVoidTransaction = require("../handlers/licences-post/doVoidTransaction");
const licencesDB = require("../helpers/licencesDB");
const router = express_1.Router();
router.get("/", (_req, res) => {
    res.render("licence-search", {
        headTitle: "Lottery Licences"
    });
});
router.post("/doSearch", handler_doSearch.handler);
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
], permissionHandlers.createGetHandler, handler_new.handler);
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
router.post("/doSave", permissionHandlers.createPostHandler, handler_doSave.handler);
router.post("/doAddTransaction", permissionHandlers.createPostHandler, handler_doAddTransaction.handler);
router.post("/doVoidTransaction", permissionHandlers.createPostHandler, handler_doVoidTransaction.handler);
router.post("/doIssueLicence", permissionHandlers.createPostHandler, handler_doIssueLicence.handler);
router.post("/doUnissueLicence", permissionHandlers.createPostHandler, handler_doUnissueLicence.handler);
router.post("/doDelete", permissionHandlers.createPostHandler, handler_doDelete.handler);
router.get("/:licenceID", handler_view.handler);
router.get("/:licenceID/edit", handler_edit.handler);
router.get("/:licenceID/print", handler_print.handler);
router.get("/:licenceID/poke", permissionHandlers.adminGetHandler, handler_poke.handler);
module.exports = router;
