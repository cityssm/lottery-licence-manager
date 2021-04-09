"use strict";
const express_1 = require("express");
const permissionHandlers = require("../handlers/permissions");
const view_1 = require("../handlers/events-get/view");
const edit_1 = require("../handlers/events-get/edit");
const poke_1 = require("../handlers/events-get/poke");
const doGetEventsByWeek_1 = require("../handlers/events-post/doGetEventsByWeek");
const outstanding_1 = require("../handlers/events-get/outstanding");
const doGetOutstandingEvents_1 = require("../handlers/events-post/doGetOutstandingEvents");
const financials_1 = require("../handlers/events-get/financials");
const doGetFinancialSummary_1 = require("../handlers/events-post/doGetFinancialSummary");
const doSearch_1 = require("../handlers/events-post/doSearch");
const doGetPastBankInformation_1 = require("../handlers/events-post/doGetPastBankInformation");
const doSave_1 = require("../handlers/events-post/doSave");
const doDelete_1 = require("../handlers/events-post/doDelete");
const licencesDB = require("../helpers/licencesDB");
const router = express_1.Router();
router.get("/", (_req, res) => {
    const eventTableStats = licencesDB.getEventTableStats();
    res.render("event-search", {
        headTitle: "Lottery Events",
        eventTableStats
    });
});
router.post("/doSearch", doSearch_1.handler);
router.get("/byWeek", (_req, res) => {
    res.render("event-byWeek", {
        headTitle: "Events By Week"
    });
});
router.post("/doGetEventsByWeek", doGetEventsByWeek_1.handler);
router.get("/recent", (req, res) => {
    const records = licencesDB.getRecentlyUpdateEvents(req.session);
    res.render("event-recent", {
        headTitle: "Recently Updated Events",
        records
    });
});
router.get("/outstanding", outstanding_1.handler);
router.post("/doGetOutstandingEvents", doGetOutstandingEvents_1.handler);
router.get("/financials", financials_1.handler);
router.post("/doGetFinancialSummary", doGetFinancialSummary_1.handler);
router.post("/doGetPastBankInformation", doGetPastBankInformation_1.handler);
router.post("/doSave", permissionHandlers.updatePostHandler, doSave_1.handler);
router.post("/doDelete", permissionHandlers.updatePostHandler, doDelete_1.handler);
router.get("/:licenceID/:eventDate", view_1.handler);
router.get("/:licenceID/:eventDate/edit", permissionHandlers.updateGetHandler, edit_1.handler);
router.get("/:licenceID/:eventDate/poke", permissionHandlers.adminGetHandler, poke_1.handler);
module.exports = router;
