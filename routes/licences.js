/* global require, module, __dirname */

const express = require("express");
const router = express.Router();

const config = require("../data/config");

const dateTimeFns = require("../helpers/dateTimeFns");
const licencesDB = require("../helpers/licencesDB");


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
    organization = licencesDB.getOrganization(organizationID);
  }

  const currentDateAsString = dateTimeFns.dateToString(new Date());

  res.render("licence-edit", {
    isCreate: true,
    licence: {
      ApplicationDateString: currentDateAsString,
      Municipality: config.defaults.city,
      StartDateString: currentDateAsString,
      EndDateString: currentDateAsString,
      StartTimeString: "00:00",
      EndTimeString: "00:00",
      events: []
    },
    organization: organization
  });
});

router.post("/doSave", function(req, res) {
  "use strict";

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

router.get("/:licenceID", function(req, res) {
  "use strict";

  const licenceID = req.params.licenceID;

  const licence = licencesDB.getLicence(licenceID);

  if (!licence) {
    res.redirect("/licences");
  } else {

    const organization = licencesDB.getOrganization(licence.OrganizationID);

    res.render("licence-view", {
      licence: licence,
      organization: organization
    });
  }
});

router.get("/:licenceID/edit", function(req, res) {
  "use strict";

  if (req.session.user.userProperties.licences_canEdit !== "true") {
    res.redirect("/licences");
  }

  const licenceID = req.params.licenceID;

  const licence = licencesDB.getLicence(licenceID);

  if (!licence) {
    res.redirect("/licences");
  } else {

    const organization = licencesDB.getOrganization(licence.OrganizationID);

    res.render("licence-edit", {
      isCreate: false,
      licence: licence,
      organization: organization
    });
  }
});

router.get("/:licenceID/print", function(req, res, next) {
  "use strict";

  const licenceID = req.params.licenceID;

  const licence = licencesDB.getLicence(licenceID);

  if (!licence) {
    res.redirect("/licences");

  } else {

    const organization = licencesDB.getOrganization(licence.OrganizationID);

    const path = require("path");
    const ejs = require("ejs");
    const pdf = require("html-pdf");

    ejs.renderFile(path.join(__dirname, "../reports/", config.licences.printTemplate), {
        config: config,
        licence: licence,
        organization: organization
      }, {},
      function(ejsErr, ejsData) {
        if (ejsErr) {
          next();
        } else {

          let options = {
            "format": "Letter",
            "base": "http://localhost:" + config.application.port
          };

          pdf.create(ejsData, options).toStream(function(pdfErr, pdfStream) {
            if (pdfErr) {
              res.send(pdfErr);
            } else {
              res.setHeader("Content-Disposition", "attachment; filename=licence-" + licenceID + ".pdf");
              res.setHeader("Content-Type", "application/pdf");
              pdfStream.pipe(res);
            }
          });
        }
      });
  }
});

module.exports = router;
