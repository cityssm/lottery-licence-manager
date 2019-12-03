/* global require, module */

const express = require("express");
const router = express.Router();

const licencesDB = require("../helpers/licencesDB");



router.get("/", function(req, res) {
  "use strict";

  const dateTimeFns = require("../helpers/dateTimeFns");

  res.render("event-search", {
    headTitle: "Events",
    dateTimeFns: dateTimeFns
  });
});


router.post("/doSearch", function(req, res) {
  "use strict";
  res.json(licencesDB.getEvents(req.body.year, req.body.month));
});


router.get("/:licenceID/:eventDate", function(req, res) {
  "use strict";

  const licenceID = req.params.licenceID;
  const eventDate = req.params.eventDate;

  const eventObj = licencesDB.getEvent(licenceID, eventDate);

  if (!eventObj) {
    res.redirect("/events/?error=eventNotFound");
    return;
  }

  const licence = licencesDB.getLicence(licenceID);

  res.render("event-view", {
    headTitle: "Event View",
    event: eventObj,
    licence: licence
  });
});


router.get("/:licenceID/:eventDate/edit", function(req, res) {
  "use strict";

  if (req.session.user.userProperties.events_canEdit !== "true") {
    res.redirect("/events/?error=accessDenied");
    return;
  }

  const licenceID = req.params.licenceID;
  const eventDate = req.params.eventDate;

  const eventObj = licencesDB.getEvent(licenceID, eventDate);

  if (!eventObj) {
    res.redirect("/events/?error=eventNotFound");
    return;
  }

  const licence = licencesDB.getLicence(licenceID);

  res.render("event-edit", {
    headTitle: "Event Update",
    event: eventObj,
    licence: licence
  });
});


module.exports = router;
