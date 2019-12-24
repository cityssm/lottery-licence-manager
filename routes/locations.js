/* global require, module */

const express = require("express");
const router = express.Router();

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


module.exports = router;
