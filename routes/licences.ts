import { Router } from "express";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";
import * as configFns from "../helpers/configFns";

import * as permissionHandlers from "../handlers/permissions";

import * as handler_doSearch from "../handlers/licences-post/doSearch";

import * as handler_view from "../handlers/licences-get/view";
import * as handler_new from "../handlers/licences-get/new";
import * as handler_edit from "../handlers/licences-get/edit";
import * as handler_print from "../handlers/licences-get/print";

import * as handler_doSave from "../handlers/licences-post/doSave";
import * as handler_doUnissueLicence from "../handlers/licences-post/doUnissueLicence";

import * as handler_doAddTransaction from "../handlers/licences-post/doAddTransaction";
import * as handler_doVoidTransaction from "../handlers/licences-post/doVoidTransaction";

import * as licencesDB from "../helpers/licencesDB";


const router = Router();


/*
 * Licence Search
 */


router.get("/", (_req, res) => {

  res.render("licence-search", {
    headTitle: "Lottery Licences"
  });

});


router.post("/doSearch", handler_doSearch.handler);


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
    applicationDateStartString,
    applicationDateEndString
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
    startDateStartString,
    startDateEndString
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
],
  permissionHandlers.createGetHandler,
  handler_new.handler);


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


router.post("/doSave",
  permissionHandlers.createPostHandler,
  handler_doSave.handler);


router.post("/doAddTransaction",
  permissionHandlers.createPostHandler,
  handler_doAddTransaction.handler);


router.post("/doVoidTransaction",
  permissionHandlers.createPostHandler,
  handler_doVoidTransaction.handler);


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


router.post("/doUnissueLicence",
  permissionHandlers.createPostHandler,
  handler_doUnissueLicence.handler);


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


router.get("/:licenceID", handler_view.handler);


router.get("/:licenceID/edit", handler_edit.handler);


router.get("/:licenceID/print", handler_print.handler);


router.get("/:licenceID/poke", (req, res) => {

  const licenceID = parseInt(req.params.licenceID, 10);

  if (req.session.user.userProperties.isAdmin) {
    licencesDB.pokeLicence(licenceID, req.session);
  }

  res.redirect("/licences/" + licenceID.toString());
});


export = router;
