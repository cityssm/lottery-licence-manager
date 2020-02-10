"use strict";

import express = require("express");
const router = express.Router();

import * as dateTimeFns from "../helpers/dateTimeFns";

import * as licencesDB from "../helpers/licencesDB";

/*
 * Event Calendar
 */

router.get("/", function(_req, res) {

  const eventTableStats = licencesDB.getEventTableStats();

  res.render("event-search", {
    headTitle: "Events By Month",
    eventTableStats: eventTableStats
  });

});

router.post("/doSearch", function(req, res) {

  res.json(licencesDB.getEvents(req.body.year, req.body.month, req.session));

});

/*
 * Outstanding Events Report
 */

router.get("/outstanding", function(_req, res) {

  res.render("event-outstanding", {
    headTitle: "Outstanding Events"
  });

});


router.post("/doGetOutstandingEvents", function(req, res) {

  const events = licencesDB.getOutstandingEvents(req.body, req.session);

  res.json(events);

});


/*
 * Financial Summary
 */

router.get("/financials", function(_req, res) {

  // Get event table stats

  const eventTableStats = licencesDB.getEventTableStats();

  // Set application dates

  const eventDate = new Date();

  eventDate.setMonth(eventDate.getMonth() - 1);
  eventDate.setDate(1);

  const eventDateStartString = dateTimeFns.dateToString(eventDate);

  eventDate.setMonth(eventDate.getMonth() + 1);
  eventDate.setDate(0);

  const eventDateEndString = dateTimeFns.dateToString(eventDate);

  res.render("event-financials", {
    headTitle: "Financial Summary",
    pageContainerIsFullWidth: true,
    eventYearMin: (eventTableStats.eventYearMin || new Date().getFullYear() + 1),
    eventDateStartString: eventDateStartString,
    eventDateEndString: eventDateEndString
  });

});

router.post("/doGetFinancialSummary", function(req, res) {

  const summary = licencesDB.getEventFinancialSummary(req.body);

  res.json(summary);

});


/*
 * Event View / Edit
 */

router.post("/doSave", function(req, res) {

  if (!req.session.user.userProperties.canUpdate) {

    res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
      });

    return;

  }

  const changeCount = licencesDB.updateEvent(req.body, req.session);

  if (changeCount) {

    res.json({
      success: true,
      message: "Event updated successfully."
    });

  } else {

    res.json({
      success: false,
      message: "Record Not Saved"
    });

  }

});


router.post("/doDelete", function(req, res) {

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


router.get("/:licenceID/:eventDate", function(req, res) {

  const licenceID = parseInt(req.params.licenceID);
  const eventDate = parseInt(req.params.eventDate);

  const eventObj = licencesDB.getEvent(licenceID, eventDate, req.session);

  if (!eventObj) {

    res.redirect("/events/?error=eventNotFound");
    return;

  }

  const licence = licencesDB.getLicence(licenceID, req.session);
  const organization = licencesDB.getOrganization(licence.organizationID, req.session);

  res.render("event-view", {
    headTitle: "Event View",
    event: eventObj,
    licence: licence,
    organization: organization
  });

});


router.get("/:licenceID/:eventDate/edit", function(req, res) {

  const licenceID = parseInt(req.params.licenceID);
  const eventDate = parseInt(req.params.eventDate);

  if (!req.session.user.userProperties.canUpdate) {

    res.redirect("/events/" + licenceID + "/" + eventDate + "/?error=accessDenied");
    return;

  }

  const eventObj = licencesDB.getEvent(licenceID, eventDate, req.session);

  if (!eventObj) {

    res.redirect("/events/?error=eventNotFound");
    return;

  }

  if (!eventObj.canUpdate) {

    res.redirect("/events/" + licenceID + "/" + eventDate + "/?error=accessDenied");
    return;

  }

  const licence = licencesDB.getLicence(licenceID, req.session);
  const organization = licencesDB.getOrganization(licence.organizationID, req.session);

  res.render("event-edit", {
    headTitle: "Event Update",
    event: eventObj,
    licence: licence,
    organization: organization
  });

});


router.get("/:licenceID/:eventDate/poke", function(req, res) {

  const licenceID = parseInt(req.params.licenceID);
  const eventDate = parseInt(req.params.eventDate);

  if (req.session.user.userProperties.isAdmin) {

    licencesDB.pokeEvent(licenceID, eventDate, req.session);

  }

  res.redirect("/events/" + licenceID + "/" + eventDate);

});


export = router;
