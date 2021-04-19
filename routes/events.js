import { Router } from "express";
import * as permissionHandlers from "../handlers/permissions.js";
import { handler as handler_view } from "../handlers/events-get/view.js";
import { handler as handler_edit } from "../handlers/events-get/edit.js";
import { handler as handler_poke } from "../handlers/events-get/poke.js";
import { handler as handler_doGetEventsByWeek } from "../handlers/events-post/doGetEventsByWeek.js";
import { handler as handler_outstanding } from "../handlers/events-get/outstanding.js";
import { handler as handler_doGetOutstandingEvents } from "../handlers/events-post/doGetOutstandingEvents.js";
import { handler as handler_financials } from "../handlers/events-get/financials.js";
import { handler as handler_doGetFinancialSummary } from "../handlers/events-post/doGetFinancialSummary.js";
import { handler as handler_doSearch } from "../handlers/events-post/doSearch.js";
import { handler as handler_doGetPastBankInformation } from "../handlers/events-post/doGetPastBankInformation.js";
import { handler as handler_doSave } from "../handlers/events-post/doSave.js";
import { handler as handler_doDelete } from "../handlers/events-post/doDelete.js";
import * as licencesDB from "../helpers/licencesDB.js";
export const router = Router();
router.get("/", (_req, res) => {
    const eventTableStats = licencesDB.getEventTableStats();
    res.render("event-search", {
        headTitle: "Lottery Events",
        eventTableStats
    });
});
router.post("/doSearch", handler_doSearch);
router.get("/byWeek", (_req, res) => {
    res.render("event-byWeek", {
        headTitle: "Events By Week"
    });
});
router.post("/doGetEventsByWeek", handler_doGetEventsByWeek);
router.get("/recent", (req, res) => {
    const records = licencesDB.getRecentlyUpdateEvents(req.session);
    res.render("event-recent", {
        headTitle: "Recently Updated Events",
        records
    });
});
router.get("/outstanding", handler_outstanding);
router.post("/doGetOutstandingEvents", handler_doGetOutstandingEvents);
router.get("/financials", handler_financials);
router.post("/doGetFinancialSummary", handler_doGetFinancialSummary);
router.post("/doGetPastBankInformation", handler_doGetPastBankInformation);
router.post("/doSave", permissionHandlers.updatePostHandler, handler_doSave);
router.post("/doDelete", permissionHandlers.updatePostHandler, handler_doDelete);
router.get("/:licenceID/:eventDate", handler_view);
router.get("/:licenceID/:eventDate/edit", permissionHandlers.updateGetHandler, handler_edit);
router.get("/:licenceID/:eventDate/poke", permissionHandlers.adminGetHandler, handler_poke);
