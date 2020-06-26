import { Router } from "express";
const router = Router();

import * as path from "path";
import * as ejs from "ejs";

// tslint:disable-next-line
const convertHTMLToPDF = require("pdf-puppeteer");

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";
import * as configFns from "../helpers/configFns";

import * as licencesDB from "../helpers/licencesDB";
import * as licencesDBOrganizations from "../helpers/licencesDB-organizations";
import { Organization } from "../helpers/llmTypes";


/*
 * Licence Search
 */


router.get("/", (_req, res) => {

  res.render("licence-search", {
    headTitle: "Lottery Licences"
  });

});


router.post("/doSearch", (req, res) => {

  res.json(licencesDB.getLicences(req.body, req.session, {
    includeOrganization: true,
    limit: req.body.limit,
    offset: req.body.offset
  }));

});


/*
 * Licence Type Summary
 */


router.get("/licenceTypes", (_req, res) => {

  // Get licence table stats

  const licenceTableStats = licencesDB.getLicenceTableStats();

  // Set application dates

  const applicationDate = new Date();

  applicationDate.setMonth(applicationDate.getMonth() - 1);
  applicationDate.setDate(1);

  const applicationDateStartString = dateTimeFns.dateToString(applicationDate);

  applicationDate.setMonth(applicationDate.getMonth() + 1);
  applicationDate.setDate(0);

  const applicationDateEndString = dateTimeFns.dateToString(applicationDate);

  // Render

  res.render("licence-licenceType", {
    headTitle: "Licence Type Summary",
    applicationYearMin: (licenceTableStats.applicationYearMin || new Date().getFullYear()),
    applicationDateStartString: applicationDateStartString,
    applicationDateEndString: applicationDateEndString
  });

});

router.post("/doGetLicenceTypeSummary", (req, res) => {

  res.json(licencesDB.getLicenceTypeSummary(req.body));

});


/*
 * Active Licence Summary
 */


router.get("/activeSummary", (_req, res) => {

  // Get licence table stats

  const licenceTableStats = licencesDB.getLicenceTableStats();

  // Set start dates

  const startDate = new Date();

  startDate.setDate(1);

  const startDateStartString = dateTimeFns.dateToString(startDate);

  startDate.setMonth(startDate.getMonth() + 1);
  startDate.setDate(0);

  const startDateEndString = dateTimeFns.dateToString(startDate);

  // Render

  res.render("licence-activeSummary", {
    headTitle: "Active Licence Summary",
    startYearMin: (licenceTableStats.startYearMin || new Date().getFullYear()),
    startDateStartString: startDateStartString,
    startDateEndString: startDateEndString
  });

});

router.post("/doGetActiveLicenceSummary", (req, res) => {

  res.json(licencesDB.getActiveLicenceSummary(req.body, req.session));

});


/*
 * Licence View / Edit
 */


router.get([
  "/new",
  "/new/:organizationID"
], (req, res) => {

  // Check permission

  if (!req.session.user.userProperties.canCreate) {

    res.redirect("/licences/?error=accessDenied");
    return;

  }

  // Get organization (if set)

  const organizationID = parseInt(req.params.organizationID, 10);

  let organization: Organization = null;

  if (organizationID) {

    organization = licencesDBOrganizations.getOrganization(organizationID, req.session);

    if (organization && !organization.isEligibleForLicences) {

      organization = null;

    }

  }

  // Use current date as default

  const currentDateAsString = dateTimeFns.dateToString(new Date());

  // Get next external licence number

  let externalLicenceNumber = "";

  const licenceNumberCalculationType = configFns.getProperty("licences.externalLicenceNumber.newCalculation");

  if (licenceNumberCalculationType === "range") {

    externalLicenceNumber = licencesDB.getNextExternalLicenceNumberFromRange().toString();

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
    organization: organization
  });

});


router.post("/doGetDistinctTermsConditions", (req, res) => {

  const organizationID = req.body.organizationID;

  res.json(licencesDB.getDistinctTermsConditions(organizationID));

});


router.post("/doGetTicketTypes", (req, res) => {

  const licenceTypeKey = req.body.licenceTypeKey;

  const licenceType = configFns.getLicenceType(licenceTypeKey);

  if (licenceType) {

    res.json(licenceType.ticketTypes || []);

  } else {

    res.json([]);

  }

});


router.post("/doSave", (req, res) => {

  if (!req.session.user.userProperties.canCreate) {

    res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
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


router.post("/doAddTransaction", (req, res) => {

  if (!req.session.user.userProperties.canCreate) {

    res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
      });
    return;

  }

  const newTransactionIndex = licencesDB.addTransaction(req.body, req.session);

  res.json({
    success: true,
    message: "Transaction Added Successfully",
    transactionIndex: newTransactionIndex
  });

});


router.post("/doVoidTransaction", (req, res) => {

  if (!req.session.user.userProperties.canCreate) {

    res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
      });

    return;

  }

  const success = licencesDB.voidTransaction(req.body.licenceID, req.body.transactionIndex, req.session);

  if (success) {

    res.json({
      success: true,
      message: "Transaction Voided Successfully"
    });

  } else {

    res.json({
      success: false,
      message: "Transaction Not Voided"
    });

  }

});


router.post("/doIssueLicence", (req, res) => {

  if (!req.session.user.userProperties.canCreate) {

    res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
      });

    return;

  }

  const success = licencesDB.issueLicence(req.body.licenceID, req.session);

  if (success) {

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


router.post("/doUnissueLicence", (req, res) => {

  if (!req.session.user.userProperties.canCreate) {

    res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
      });
    return;

  }

  const success = licencesDB.unissueLicence(req.body.licenceID, req.session);

  if (success) {

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


router.post("/doDelete", (req, res) => {

  if (!req.session.user.userProperties.canCreate) {

    res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
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


router.get("/:licenceID", (req, res) => {

  const licenceID = parseInt(req.params.licenceID, 10);

  const licence = licencesDB.getLicence(licenceID, req.session);

  if (!licence) {

    res.redirect("/licences/?error=licenceNotFound");
    return;

  }

  const organization = licencesDBOrganizations.getOrganization(licence.organizationID, req.session);

  const headTitle =
    configFns.getProperty("licences.externalLicenceNumber.isPreferredID") ?
      "Licence " + licence.externalLicenceNumber :
      "Licence #" + licenceID;

  res.render("licence-view", {
    headTitle: headTitle,
    licence: licence,
    organization: organization
  });

});


router.get("/:licenceID/edit", (req, res) => {

  const licenceID = parseInt(req.params.licenceID, 10);

  if (!req.session.user.userProperties.canCreate) {

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


  const organization = licencesDBOrganizations.getOrganization(licence.organizationID, req.session);

  const feeCalculation = configFns.getProperty("licences.feeCalculationFn")(licence);

  res.render("licence-edit", {
    headTitle: "Licence #" + licenceID + " Update",
    isCreate: false,
    licence: licence,
    organization: organization,
    feeCalculation: feeCalculation
  });

});


router.get("/:licenceID/print", (req, res, next) => {

  const licenceID = parseInt(req.params.licenceID, 10);

  const licence = licencesDB.getLicence(licenceID, req.session);

  if (!licence) {

    res.redirect("/licences/?error=licenceNotFound");
    return;

  }

  if (!licence.issueDate) {

    res.redirect("/licences/?error=licenceNotIssued");
    return;

  }

  const organization = licencesDBOrganizations.getOrganization(licence.organizationID, req.session);

  ejs.renderFile(
    path.join(__dirname, "../reports/", configFns.getProperty("licences.printTemplate")), {
      configFns: configFns,
      licence: licence,
      organization: organization
    }, {},
    (ejsErr, ejsData) => {

      if (ejsErr) {
        return next(ejsErr);
      }

      convertHTMLToPDF(ejsData, (pdf) => {

        res.setHeader(
          "Content-Disposition",
          "attachment; filename=licence-" + licenceID + "-" + licence.recordUpdate_timeMillis + ".pdf"
        );
        res.setHeader("Content-Type", "application/pdf");

        res.send(pdf);

      }, {
          format: "Letter",
          printBackground: true,
          preferCSSPageSize: true
        });

      return null;
    }
  );
});


router.get("/:licenceID/poke", (req, res) => {

  const licenceID = parseInt(req.params.licenceID, 10);

  if (req.session.user.userProperties.isAdmin) {
    licencesDB.pokeLicence(licenceID, req.session);
  }

  res.redirect("/licences/" + licenceID);
});


export = router;
