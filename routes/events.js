/* global require, module */

const express = require("express");
const router = express.Router();

const licencesDB = require("../helpers/licencesDB");
const configFns = require("../helpers/configFns");



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

  if (req.session.user.userProperties.canCreate !== "true") {
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

  if (req.session.user.userProperties.canUpdate !== "true") {

    if (eventObj.RecordCreate_UserName !== req.session.user.userName ||
      eventObj.RecordUpdate_UserName !== req.session.user.userName ||
      eventObj.RecordUpdate_TimeMillis + configFns.getProperty("user.createUpdateWindowMillis") < Date.now()) {

      res.redirect("/events/" + licenceID + "/" + eventDate + "/?error=accessDenied");
      return;
    }
  }

  const licence = licencesDB.getLicence(licenceID);

  res.render("event-edit", {
    headTitle: "Event Update",
    event: eventObj,
    licence: licence
  });
});


module.exports = router;
