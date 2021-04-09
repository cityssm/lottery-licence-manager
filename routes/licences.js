"use strict";
const express_1 = require("express");
const permissionHandlers = require("../handlers/permissions");
const doSearch_1 = require("../handlers/licences-post/doSearch");
const view_1 = require("../handlers/licences-get/view");
const new_1 = require("../handlers/licences-get/new");
const edit_1 = require("../handlers/licences-get/edit");
const print_1 = require("../handlers/licences-get/print");
const poke_1 = require("../handlers/licences-get/poke");
const doGetTicketTypes_1 = require("../handlers/licences-post/doGetTicketTypes");
const doSave_1 = require("../handlers/licences-post/doSave");
const doIssueLicence_1 = require("../handlers/licences-post/doIssueLicence");
const doUnissueLicence_1 = require("../handlers/licences-post/doUnissueLicence");
const doDelete_1 = require("../handlers/licences-post/doDelete");
const doGetDistinctTermsConditions_1 = require("../handlers/licences-post/doGetDistinctTermsConditions");
const doAddTransaction_1 = require("../handlers/licences-post/doAddTransaction");
const doVoidTransaction_1 = require("../handlers/licences-post/doVoidTransaction");
const licenceTypes_1 = require("../handlers/licences-get/licenceTypes");
const activeSummary_1 = require("../handlers/licences-get/activeSummary");
const licencesDB = require("../helpers/licencesDB");
const router = express_1.Router();
router.get("/", (_req, res) => {
    res.render("licence-search", {
        headTitle: "Lottery Licences"
    });
});
router.post("/doSearch", doSearch_1.handler);
router.get("/licenceTypes", licenceTypes_1.handler);
router.post("/doGetLicenceTypeSummary", (req, res) => {
    res.json(licencesDB.getLicenceTypeSummary(req.body));
});
router.get("/activeSummary", activeSummary_1.handler);
router.post("/doGetActiveLicenceSummary", (req, res) => {
    res.json(licencesDB.getActiveLicenceSummary(req.body, req.session));
});
router.get([
    "/new",
    "/new/:organizationID"
], permissionHandlers.createGetHandler, new_1.handler);
router.post("/doGetDistinctTermsConditions", doGetDistinctTermsConditions_1.handler);
router.post("/doGetTicketTypes", doGetTicketTypes_1.handler);
router.post("/doSave", permissionHandlers.createPostHandler, doSave_1.handler);
router.post("/doAddTransaction", permissionHandlers.createPostHandler, doAddTransaction_1.handler);
router.post("/doVoidTransaction", permissionHandlers.createPostHandler, doVoidTransaction_1.handler);
router.post("/doIssueLicence", permissionHandlers.createPostHandler, doIssueLicence_1.handler);
router.post("/doUnissueLicence", permissionHandlers.createPostHandler, doUnissueLicence_1.handler);
router.post("/doDelete", permissionHandlers.createPostHandler, doDelete_1.handler);
router.get("/:licenceID", view_1.handler);
router.get("/:licenceID/edit", permissionHandlers.createGetHandler, edit_1.handler);
router.get("/:licenceID/print", print_1.handler);
router.get("/:licenceID/poke", permissionHandlers.adminGetHandler, poke_1.handler);
module.exports = router;
