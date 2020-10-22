import { Router } from "express";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";
import * as configFns from "../helpers/configFns";

import * as permissionHandlers from "../handlers/permissions";

import * as handler_doSearch from "../handlers/licences-post/doSearch";

import * as handler_view from "../handlers/licences-get/view";
import * as handler_new from "../handlers/licences-get/new";
import * as handler_edit from "../handlers/licences-get/edit";
import * as handler_print from "../handlers/licences-get/print";
import * as handler_poke from "../handlers/licences-get/poke";

import * as handler_doSave from "../handlers/licences-post/doSave";
import * as handler_doIssueLicence from "../handlers/licences-post/doIssueLicence";
import * as handler_doUnissueLicence from "../handlers/licences-post/doUnissueLicence";
import * as handler_doDelete from "../handlers/licences-post/doDelete";

import * as handler_doGetDistinctTermsConditions from "../handlers/licences-post/doGetDistinctTermsConditions";
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


router.post("/doGetDistinctTermsConditions", handler_doGetDistinctTermsConditions.handler);


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


router.post("/doIssueLicence",
  permissionHandlers.createPostHandler,
  handler_doIssueLicence.handler);


router.post("/doUnissueLicence",
  permissionHandlers.createPostHandler,
  handler_doUnissueLicence.handler);


router.post("/doDelete",
  permissionHandlers.createPostHandler,
  handler_doDelete.handler);


router.get("/:licenceID",
  handler_view.handler);


router.get("/:licenceID/edit",
  handler_edit.handler);


router.get("/:licenceID/print",
  handler_print.handler);


router.get("/:licenceID/poke",
  permissionHandlers.adminGetHandler,
  handler_poke.handler);


export = router;
