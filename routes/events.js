import { Router } from "express";
import * as permissionHandlers from "../handlers/permissions.js";
import handler_search from "../handlers/events-get/search.js";
import handler_view from "../handlers/events-get/view.js";
import handler_edit from "../handlers/events-get/edit.js";
import handler_poke from "../handlers/events-get/poke.js";
import handler_doGetEventsByWeek from "../handlers/events-post/doGetEventsByWeek.js";
import handler_outstanding from "../handlers/events-get/outstanding.js";
import handler_doGetOutstandingEvents from "../handlers/events-post/doGetOutstandingEvents.js";
import handler_financials from "../handlers/events-get/financials.js";
import handler_doGetFinancialSummary from "../handlers/events-post/doGetFinancialSummary.js";
import handler_doSearch from "../handlers/events-post/doSearch.js";
import handler_doGetPastBankInformation from "../handlers/events-post/doGetPastBankInformation.js";
import handler_doSave from "../handlers/events-post/doSave.js";
import handler_doDelete from "../handlers/events-post/doDelete.js";
import * as licencesDB from "../helpers/licencesDB.js";
export const router = Router();
router.get("/", handler_search);
router.post("/doSearch", handler_doSearch);
router.get("/byWeek", (_request, response) => {
    response.render("event-byWeek", {
        headTitle: "Events By Week"
    });
});
router.post("/doGetEventsByWeek", handler_doGetEventsByWeek);
router.get("/recent", (request, response) => {
    const records = licencesDB.getRecentlyUpdateEvents(request.session);
    response.render("event-recent", {
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
export default router;
