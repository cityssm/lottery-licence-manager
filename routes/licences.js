/* global require, module */

const express = require("express");
const router = express.Router();

const dateFns = require("../helpers/dateFns");

router.get("/", function(req, res) {
  "use strict";
  res.render("licence-search");
});

router.get(["/new", "/new/:organizationID"], function(req, res) {
  "use strict";

  if (req.session.user.userProperties.licences_canEdit !== "true") {
    res.redirect("/licences");
  }

  const organizationID = req.params.organizationID;

  let organization = {};

  if (organizationID && organizationID !== "") {
    const licencesDB = require("../helpers/licencesDB");
    organization = licencesDB.getOrganization(organizationID);
  }

  const currentDateAsString = dateFns.dateToString(new Date());

  res.render("licence-edit", {
    isCreate: true,
    licence: {
      LicenceID: "(New Licence Number)",
      ApplicationDateString: currentDateAsString,
      StartDateString: currentDateAsString,
      EndDateString: currentDateAsString,

      StartTimeString: "0:00",
      EndTimeString: "0:05"
    },
    organization: organization
  });
});


module.exports = router;
