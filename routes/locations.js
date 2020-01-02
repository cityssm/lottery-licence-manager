/* global require, module */

const express = require("express");
const router = express.Router();

const configFns = require("../helpers/configFns");

const licencesDB = require("../helpers/licencesDB");


router.get("/", function(req, res) {
  "use strict";

  res.render("location-search", {
    headTitle: "Locations"
  });
});


router.all("/doGetLocations", function(req, res) {
  "use strict";

  const locations = licencesDB.getLocations();

  res.json(locations);
});


router.post("/doCreate", function(req, res) {
  "use strict";

  if (req.session.user.userProperties.canCreate !== "true") {
    res.json({
      success: false,
      message: "Not Allowed"
    });
    return;
  }

  const locationID = licencesDB.createLocation(req.body, req.session);

  res.json({
    success: true,
    locationID: locationID,
    locationDisplayName: (req.body.locationName === "" ? req.body.locationAddress1 : req.body.locationName)
  });
});


router.post("/doUpdate", function(req, res) {
  "use strict";

  if (req.session.user.userProperties.canCreate !== "true") {
    res.json({
      success: false,
      message: "Not Allowed"
    });
    return;
  }

  const changeCount = licencesDB.updateLocation(req.body, req.session);

  if (changeCount) {
    res.json({
      success: true,
      message: "Location updated successfully."
    });
  } else {
    res.json({
      success: false,
      message: "Record Not Saved"
    });
  }
});


router.post("/doDelete", function(req, res) {
  "use strict";

  if (req.session.user.userProperties.canCreate !== "true") {
    res.json("not allowed");
    return;
  }

  const changeCount = licencesDB.deleteLocation(req.body.locationID, req.session);

  if (changeCount) {
    res.json({
      success: true,
      message: "Location deleted successfully."
    });
  } else {
    res.json({
      success: false,
      message: "Location could not be deleted."
    });
  }
});


router.get("/new", function(req, res) {
  "use strict";

  if (req.session.user.userProperties.canCreate !== "true") {
    res.redirect("/locations/?error=accessDenied-noCreate");
    return;
  }

  const dateTimeFns = require("../helpers/dateTimeFns");
  const stringFns = require("../helpers/stringFns");

  res.render("location-edit", {
    headTitle: "Create a New Location",
    location: {
      locationCity: configFns.getProperty("defaults.city"),
      locationProvince: configFns.getProperty("defaults.province")
    },
    currentDateInteger: dateTimeFns.dateToInteger(new Date()),
    stringFns: stringFns,
    isCreate: true
  });
});


router.get("/:locationID", function(req, res) {
  "use strict";

  const locationID = req.params.locationID;

  const location = licencesDB.getLocation(locationID, req.session);

  if (!location) {
    res.redirect("/locations/?error=locationNotFound");
    return;
  }

  const dateTimeFns = require("../helpers/dateTimeFns");
  const stringFns = require("../helpers/stringFns");

  const licences = licencesDB.getLicences({
    locationID: locationID
  }, true, false, req.session);

  res.render("location-view", {
    headTitle: location.locationDisplayName,
    location: location,
    licences: licences,
    currentDateInteger: dateTimeFns.dateToInteger(new Date()),
    stringFns: stringFns
  });
});


router.get("/:locationID/edit", function(req, res) {
  "use strict";

  const locationID = req.params.locationID;

  if (req.session.user.userProperties.canCreate !== "true") {
    res.redirect("/locations/" + locationID + "/?error=accessDenied-noCreate");
    return;
  }

  const location = licencesDB.getLocation(locationID, req.session);

  if (!location) {
    res.redirect("/locations/?error=locationNotFound");
    return;
  }

  if (!location.canUpdate) {
    res.redirect("/locations/" + locationID + "/?error=accessDenied-noUpdate");
    return;
  }

  const dateTimeFns = require("../helpers/dateTimeFns");
  const stringFns = require("../helpers/stringFns");

  const licences = licencesDB.getLicences({
    locationID: locationID
  }, true, false, req.session) || [];

  res.render("location-edit", {
    headTitle: location.locationDisplayName,
    location: location,
    licences: licences,
    currentDateInteger: dateTimeFns.dateToInteger(new Date()),
    stringFns: stringFns,
    isCreate: false
  });
});


module.exports = router;
