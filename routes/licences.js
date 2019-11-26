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
      ApplicationDateString: currentDateAsString,
      StartDateString: currentDateAsString,
      EndDateString: currentDateAsString,
      StartTimeString: "00:00",
      EndTimeString: "00:00"
    },
    organization: organization
  });
});

router.post("/doSave", function(req, res) {
  "use strict";

  const licencesDB = require("../helpers/licencesDB");

  if (req.body.licenceID === "") {

    const newLicenceID = licencesDB.createLicence(req.body, req.session);

    res.json({
      success: true,
      licenceID: newLicenceID
    });

  } else {

    const changeCount = licencesDB.updateLicence(req.body, req.session);

    if (changeCount) {
      res.json({
        success: true,
        message: "Licence Updated"
      });
    } else {
      res.json({
        success: false,
        message: "Record Not Saved"
      });
    }
  }
});

module.exports = router;
