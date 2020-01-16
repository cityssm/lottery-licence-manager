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
      licenceDetails: "",
      termsConditions: "",
      licenceTicketTypes: [],
      events: []
    },
    organization: organization,
    dateTimeFns: dateTimeFns
  });
});


router.post("/doGetDistinctTermsConditions", function(req, res) {
  "use strict";

  const organizationID = req.body.organizationID;

  res.json(licencesDB.getDistinctTermsConditions(organizationID));
});


router.post("/doGetTicketTypes", function(req, res) {
  "use strict";

  const licenceTypeKey = req.body.licenceTypeKey;

  const licenceType = configFns.getLicenceType(licenceTypeKey);

  if (licenceType) {
    res.json(licenceType.ticketTypes || []);
  } else {
    res.json([]);
  }
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


router.post("/doAddTransaction", function(req, res) {
  "use strict";

  if (req.session.user.userProperties.canCreate !== "true") {
    res.json({
      success: false,
      message: "Not Allowed"
    });
    return;
  }

  const changeCount = licencesDB.addTransaction(req.body, req.session);

  if (changeCount) {
    res.json({
      success: true,
      message: "Transaction Added Successfully"
    });
  } else {
    res.json({
      success: false,
      message: "Transaction Not Added"
    });
  }
});


router.post("/doIssueLicence", function(req, res) {
  "use strict";

  if (req.session.user.userProperties.canCreate !== "true") {
    res.json({
      success: false,
      message: "Not Allowed"
    });
    return;
  }

  const changeCount = licencesDB.issueLicence(req.body, req.session);

  if (changeCount) {
    res.json({
      success: true,
      message: "Licence Issued Successfully"
    });
  } else {
    res.json({
      success: false,
      message: "Licence Not Issued"
    });
  }
});


router.post("/doUnissueLicence", function(req, res) {
  "use strict";

  if (req.session.user.userProperties.canCreate !== "true") {
    res.json({
      success: false,
      message: "Not Allowed"
    });
    return;
  }

  const changeCount = licencesDB.unissueLicence(req.body.licenceID, req.session);

  if (changeCount) {
    res.json({
      success: true,
      message: "Licence Unissued Successfully"
    });
  } else {
    res.json({
      success: false,
      message: "Licence Not Unissued"
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

  let feeCalculation = configFns.getProperty("licences.feeCalculationFn")(licence);

  res.render("licence-edit", {
    headTitle: "Licence #" + licenceID + " Update",
    isCreate: false,
    licence: licence,
    organization: organization,
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

  if (!licence.issueDate) {
    res.redirect("/licences/?error=licenceNotIssued");
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
        next(ejsErr);
      } else {

        let options = {
          format: "Letter",
          base: "http://localhost:" + configFns.getProperty("application.httpPort"),
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


router.get("/:licenceID/poke", function(req, res) {
  "use strict";

  const licenceID = req.params.licenceID;

  if (req.session.user.userProperties.isAdmin === "true") {
    licencesDB.pokeLicence(licenceID, req.session);
  }

  res.redirect("/licences/" + licenceID);
});




module.exports = router;
