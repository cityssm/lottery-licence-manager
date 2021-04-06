import { Router } from "express";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";

import * as permissionHandlers from "../handlers/permissions";

import { handler as handler_view } from "../handlers/events-get/view";
import { handler as handler_edit } from "../handlers/events-get/edit";
import { handler as handler_poke } from "../handlers/events-get/poke";

import { handler as handler_outstanding } from "../handlers/events-get/outstanding";
import { handler as handler_doGetOutstandingEvents } from "../handlers/events-post/doGetOutstandingEvents";

import { handler as handler_financials } from "../handlers/events-get/financials";
import { handler as handler_doGetFinancialSummary } from "../handlers/events-post/doGetFinancialSummary";

import { handler as handler_doSearch } from "../handlers/events-post/doSearch";
import { handler as handler_doGetPastBankInformation } from "../handlers/events-post/doGetPastBankInformation";
import { handler as handler_doSave } from "../handlers/events-post/doSave";

import * as licencesDB from "../helpers/licencesDB";


const router = Router();


/*
 * Event Calendar
 */

router.get("/", (_req, res) => {

  const eventTableStats = licencesDB.getEventTableStats();

  res.render("event-search", {
    headTitle: "Lottery Events",
    eventTableStats
  });

});

router.post("/doSearch", handler_doSearch);

/*
 * Events by Week
 */

router.get("/byWeek", (_req, res) => {

  res.render("event-byWeek", {
    headTitle: "Events By Week"
  });

});

router.post("/doGetEventsByWeek", (req, res) => {

  const dateWithinWeek = dateTimeFns.dateStringToDate(req.body.eventDate);

  dateWithinWeek.setDate(dateWithinWeek.getDate() - dateWithinWeek.getDay());

  const startDateInteger = dateTimeFns.dateToInteger(dateWithinWeek);

  dateWithinWeek.setDate(dateWithinWeek.getDate() + 6);

  const endDateInteger = dateTimeFns.dateToInteger(dateWithinWeek);

  const activity = licencesDB.getLicenceActivityByDateRange(startDateInteger, endDateInteger, req.body);

  res.json(activity);

});

/*
 * Recently Updated Events
 */

router.get("/recent", (req, res) => {

  const records = licencesDB.getRecentlyUpdateEvents(req.session);

  res.render("event-recent", {
    headTitle: "Recently Updated Events",
    records
  });

});

/*
 * Outstanding Events Report
 */

router.get("/outstanding", handler_outstanding);

router.post("/doGetOutstandingEvents", handler_doGetOutstandingEvents);


/*
 * Financial Summary
 */

router.get("/financials", handler_financials);

router.post("/doGetFinancialSummary", handler_doGetFinancialSummary);


/*
 * Event View / Edit
 */


router.post("/doGetPastBankInformation", handler_doGetPastBankInformation);


router.post("/doSave",
  permissionHandlers.updatePostHandler,
  handler_doSave);


router.post("/doDelete", (req, res) => {

  if (!req.session.user.userProperties.canUpdate) {

    res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
      });

    return;

  }

  if (req.body.licenceID === "" || req.body.eventDate === "") {

    res.json({
      success: false,
      message: "Licence ID or Event Date Unavailable"
    });

  } else {

    const changeCount = licencesDB.deleteEvent(req.body.licenceID, req.body.eventDate, req.session);

    if (changeCount) {

      res.json({
        success: true,
        message: "Event Deleted"
      });

    } else {

      res.json({
        success: false,
        message: "Event Not Deleted"
      });

    }

  }

});


router.get("/:licenceID/:eventDate", handler_view);


router.get("/:licenceID/:eventDate/edit",
  permissionHandlers.updateGetHandler,
  handler_edit);


router.get("/:licenceID/:eventDate/poke",
  permissionHandlers.adminGetHandler,
  handler_poke);


export = router;
