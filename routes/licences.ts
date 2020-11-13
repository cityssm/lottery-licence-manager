import { Router } from "express";

import * as configFns from "../helpers/configFns";

import * as permissionHandlers from "../handlers/permissions";

import { handler as handler_doSearch } from "../handlers/licences-post/doSearch";

import { handler as handler_view } from "../handlers/licences-get/view";
import { handler as handler_new } from "../handlers/licences-get/new";
import { handler as handler_edit } from "../handlers/licences-get/edit";
import { handler as handler_print } from "../handlers/licences-get/print";
import { handler as handler_poke } from "../handlers/licences-get/poke";

import { handler as handler_doSave } from "../handlers/licences-post/doSave";
import { handler as handler_doIssueLicence } from "../handlers/licences-post/doIssueLicence";
import { handler as handler_doUnissueLicence } from "../handlers/licences-post/doUnissueLicence";
import { handler as handler_doDelete } from "../handlers/licences-post/doDelete";

import { handler as handler_doGetDistinctTermsConditions } from "../handlers/licences-post/doGetDistinctTermsConditions";
import { handler as handler_doAddTransaction } from "../handlers/licences-post/doAddTransaction";
import { handler as handler_doVoidTransaction } from "../handlers/licences-post/doVoidTransaction";

import { handler as handler_licenceTypes } from "../handlers/licences-get/licenceTypes";
import { handler as handler_activeSummary } from "../handlers/licences-get/activeSummary";

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


router.post("/doSearch", handler_doSearch);


/*
 * Licence Type Summary
 */


router.get("/licenceTypes", handler_licenceTypes);

router.post("/doGetLicenceTypeSummary", (req, res) => {

  res.json(licencesDB.getLicenceTypeSummary(req.body));

});


/*
 * Active Licence Summary
 */


router.get("/activeSummary", handler_activeSummary);

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
  handler_new);


router.post("/doGetDistinctTermsConditions", handler_doGetDistinctTermsConditions);


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
  handler_doSave);


router.post("/doAddTransaction",
  permissionHandlers.createPostHandler,
  handler_doAddTransaction);


router.post("/doVoidTransaction",
  permissionHandlers.createPostHandler,
  handler_doVoidTransaction);


router.post("/doIssueLicence",
  permissionHandlers.createPostHandler,
  handler_doIssueLicence);


router.post("/doUnissueLicence",
  permissionHandlers.createPostHandler,
  handler_doUnissueLicence);


router.post("/doDelete",
  permissionHandlers.createPostHandler,
  handler_doDelete);


router.get("/:licenceID",
  handler_view);


router.get("/:licenceID/edit",
  permissionHandlers.createGetHandler,
  handler_edit);


router.get("/:licenceID/print",
  handler_print);


router.get("/:licenceID/poke",
  permissionHandlers.adminGetHandler,
  handler_poke);


export = router;
