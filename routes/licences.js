/* global require, module, __dirname */

const express = require("express");
const router = express.Router();

const configFns = require("../helpers/configFns");

const dateTimeFns = require("../helpers/dateTimeFns");
const licencesDB = require("../helpers/licencesDB");


router.get("/", function(req, res) {
  "use strict";

  res.render("licence-search", {
    headTitle: "Licences"
  });
});


router.post("/doSearch", function(req, res) {
  "use strict";

  res.json(licencesDB.getLicences(req.body, true, true, req.session));
});


router.post("/doGetDistinctLocations", function(req, res) {
  "use strict";

  const municipality = req.body.municipality;

  const locations = licencesDB.getDistinctLicenceLocations(municipality);

  res.json(locations);
});


router.get(["/new", "/new/:organizationID"], function(req, res) {
  "use strict";

  // check permission

  if (req.session.user.userProperties.canCreate !== "true") {
    res.redirect("/licences/?error=accessDenied");
    return;
  }

  // get organization (if set)

  const organizationID = req.params.organizationID;

  let organization = {};

  if (organizationID && organizationID !== "") {
    organization = licencesDB.getOrganization(organizationID, req.session) || {};

    if (!organization.isEligibleForLicences) {
      organization = {};
    }
  }

  // use current date as default

  const currentDateAsString = dateTimeFns.dateToString(new Date());

  // get next external licence number

  let externalLicenceNumber = "";

  const licenceNumberCalculationType = configFns.getProperty("licences.externalLicenceNumber.newCalculation");

  if (licenceNumberCalculationType === "range") {
    externalLicenceNumber = licencesDB.getNextExternalLicenceNumberFromRange();
  }

  // get distinct locations for datalist

  let distinctLocations = licencesDB.getDistinctLicenceLocations(configFns.getProperty("defaults.city"));

  res.render("licence-edit", {
    headTitle: "Licence Create",
    isCreate: true,
    licence: {
      externalLicenceNumber: externalLicenceNumber,
      applicationDateString: currentDateAsString,
      municipality: configFns.getProperty("defaults.city"),
      startDateString: currentDateAsString,
      endDateString: currentDateAsString,
      startTimeString: "00:00",
      endTimeString: "00:00",
      events: []
    },
    organization: organization,
    distinctLocations: distinctLocations,
    dateTimeFns: dateTimeFns
  });
});


router.post("/doSave", function(req, res) {
  "use strict";

  if (req.session.user.userProperties.canCreate !== "true") {
    res.json({
      success: false,
      message: "Not Allowed"
    });
    return;
  }

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
        message: "Licence updated successfully."
      });
    } else {
      res.json({
        success: false,
        message: "Record Not Saved"
      });
    }
  }
});


router.post("/doMarkLicenceFeePaid", function(req, res) {
  "use strict";

  if (req.session.user.userProperties.canCreate !== "true") {
    res.json({
      success: false,
      message: "Not Allowed"
    });
    return;
  }

  const changeCount = licencesDB.markLicenceFeePaid(req.body, req.session);

  if (changeCount) {
    res.json({
      success: true,
      message: "Licence Fee Paid"
    });
  } else {
    res.json({
      success: false,
      message: "Record Not Saved"
    });
  }
});


router.post("/doRemoveLicenceFee", function(req, res) {
  "use strict";

  if (req.session.user.userProperties.canCreate !== "true") {
    res.json({
      success: false,
      message: "Not Allowed"
    });
    return;
  }

  const changeCount = licencesDB.markLicenceFeeUnpaid(req.body.licenceID, req.session);

  if (changeCount) {
    res.json({
      success: true,
      message: "Licence Fee Payment Removed"
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
    res.json({
      success: false,
      message: "Not Allowed"
    });
    return;
  }

  if (req.body.licenceID === "") {

    res.json({
      success: false,
      message: "Licence ID Unavailable"
    });

  } else {

    const changeCount = licencesDB.deleteLicence(req.body.licenceID, req.session);

    if (changeCount) {
      res.json({
        success: true,
        message: "Licence Deleted"
      });
    } else {
      res.json({
        success: false,
        message: "Licence Not Deleted"
      });
    }
  }
});


router.get("/:licenceID", function(req, res) {
  "use strict";

  const licenceID = req.params.licenceID;

  const licence = licencesDB.getLicence(licenceID, req.session);

  if (!licence) {
    res.redirect("/licences/?error=licenceNotFound");
    return;
  }

  const organization = licencesDB.getOrganization(licence.organizationID, req.session);

  res.render("licence-view", {
    headTitle: "Licence #" + licenceID,
    licence: licence,
    organization: organization
  });
});


router.get("/:licenceID/edit", function(req, res) {
  "use strict";

  const licenceID = req.params.licenceID;

  if (req.session.user.userProperties.canCreate !== "true") {
    res.redirect("/licences/" + licenceID + "/?error=accessDenied");
    return;
  }

  const licence = licencesDB.getLicence(licenceID, req.session);

  if (!licence) {
    res.redirect("/licences/?error=licenceNotFound");
    return;

  } else if (!licence.canUpdate) {
    res.redirect("/licences/" + licenceID + "/?error=accessDenied");
    return;
  }


  const organization = licencesDB.getOrganization(licence.organizationID, req.session);

  let distinctLocations = licencesDB.getDistinctLicenceLocations(licence.municipality);

  let feeCalculation = configFns.getProperty("licences.feeCalculationFn")(licence);

  res.render("licence-edit", {
    headTitle: "Licence #" + licenceID + " Update",
    isCreate: false,
    licence: licence,
    organization: organization,
    distinctLocations: distinctLocations,
    feeCalculation: feeCalculation,
    dateTimeFns: dateTimeFns
  });
});


router.get("/:licenceID/print", function(req, res, next) {
  "use strict";

  const licenceID = req.params.licenceID;

  const licence = licencesDB.getLicence(licenceID, req.session);

  if (!licence) {
    res.redirect("/licences/?error=licenceNotFound");
    return;
  }

  if (!licence.licenceFeeIsPaid) {
    res.redirect("/licences/?error=licenceFeeNotPaid");
    return;
  }

  const organization = licencesDB.getOrganization(licence.organizationID, req.session);

  const path = require("path");
  const ejs = require("ejs");
  const pdf = require("html-pdf");

  ejs.renderFile(path.join(__dirname, "../reports/", configFns.getProperty("licences.printTemplate")), {
      configFns: configFns,
      licence: licence,
      organization: organization
    }, {},
    function(ejsErr, ejsData) {
      if (ejsErr) {
        next();
      } else {

        let options = {
          format: "Letter",
          base: "http://localhost:" + configFns.getProperty("application.port"),
          phantomArgs: ["--local-url-access=false"]
        };

        pdf.create(ejsData, options).toStream(function(pdfErr, pdfStream) {
          if (pdfErr) {
            res.send(pdfErr);
          } else {
            res.setHeader("Content-Disposition", "attachment; filename=licence-" + licenceID + "-" + licence.recordUpdate_timeMillis + ".pdf");
            res.setHeader("Content-Type", "application/pdf");
            pdfStream.pipe(res);
          }
        });
      }
    });
});


module.exports = router;
