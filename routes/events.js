"use strict";

const express = require("express");
const router = express.Router();

const dateTimeFns = require("../helpers/dateTimeFns");

const licencesDB = require("../helpers/licencesDB");


router.get("/", function(req, res) {

  res.render("event-search", {
    headTitle: "Events",
    dateTimeFns: dateTimeFns
  });

});


router.post("/doSearch", function(req, res) {

  res.json(licencesDB.getEvents(req.body.year, req.body.month, req.session));

});


router.post("/doSave", function(req, res) {

  if (req.session.user.userProperties.canUpdate !== "true") {

    res.json({
      success: false,
      message: "Not Allowed"
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

  if (req.session.user.userProperties.canUpdate !== "true") {

    res.json({
      success: false,
      message: "Not Allowed"
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

  const licenceID = req.params.licenceID;
  const eventDate = req.params.eventDate;

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

  const licenceID = req.params.licenceID;
  const eventDate = req.params.eventDate;

  if (req.session.user.userProperties.canUpdate !== "true") {

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

  const licenceID = req.params.licenceID;
  const eventDate = req.params.eventDate;

  if (req.session.user.userProperties.isAdmin === "true") {

    licencesDB.pokeEvent(licenceID, eventDate, req.session);

  }

  res.redirect("/events/" + licenceID + "/" + eventDate);

});


module.exports = router;
