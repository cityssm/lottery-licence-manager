import { Router } from "express";
import * as permissionHandlers from "../handlers/permissions.js";
import { handler as handler_doSearch } from "../handlers/licences-post/doSearch.js";
import { handler as handler_view } from "../handlers/licences-get/view.js";
import { handler as handler_new } from "../handlers/licences-get/new.js";
import { handler as handler_edit } from "../handlers/licences-get/edit.js";
import { handler as handler_print } from "../handlers/licences-get/print.js";
import { handler as handler_poke } from "../handlers/licences-get/poke.js";
import { handler as handler_doGetTicketTypes } from "../handlers/licences-post/doGetTicketTypes.js";
import { handler as handler_doSave } from "../handlers/licences-post/doSave.js";
import { handler as handler_doIssueLicence } from "../handlers/licences-post/doIssueLicence.js";
import { handler as handler_doUnissueLicence } from "../handlers/licences-post/doUnissueLicence.js";
import { handler as handler_doDelete } from "../handlers/licences-post/doDelete.js";
import { handler as handler_doGetDistinctTermsConditions } from "../handlers/licences-post/doGetDistinctTermsConditions.js";
import { handler as handler_doAddTransaction } from "../handlers/licences-post/doAddTransaction.js";
import { handler as handler_doVoidTransaction } from "../handlers/licences-post/doVoidTransaction.js";
import { handler as handler_licenceTypes } from "../handlers/licences-get/licenceTypes.js";
import { handler as handler_activeSummary } from "../handlers/licences-get/activeSummary.js";
import * as licencesDB from "../helpers/licencesDB.js";
export const router = Router();
router.get("/", (_req, res) => {
    res.render("licence-search", {
        headTitle: "Lottery Licences"
    });
});
router.post("/doSearch", handler_doSearch);
router.get("/licenceTypes", handler_licenceTypes);
router.post("/doGetLicenceTypeSummary", (req, res) => {
    res.json(licencesDB.getLicenceTypeSummary(req.body));
});
router.get("/activeSummary", handler_activeSummary);
router.post("/doGetActiveLicenceSummary", (req, res) => {
    res.json(licencesDB.getActiveLicenceSummary(req.body, req.session));
});
router.get([
    "/new",
    "/new/:organizationID"
], permissionHandlers.createGetHandler, handler_new);
router.post("/doGetDistinctTermsConditions", handler_doGetDistinctTermsConditions);
router.post("/doGetTicketTypes", handler_doGetTicketTypes);
router.post("/doSave", permissionHandlers.createPostHandler, handler_doSave);
router.post("/doAddTransaction", permissionHandlers.createPostHandler, handler_doAddTransaction);
router.post("/doVoidTransaction", permissionHandlers.createPostHandler, handler_doVoidTransaction);
router.post("/doIssueLicence", permissionHandlers.createPostHandler, handler_doIssueLicence);
router.post("/doUnissueLicence", permissionHandlers.createPostHandler, handler_doUnissueLicence);
router.post("/doDelete", permissionHandlers.createPostHandler, handler_doDelete);
router.get("/:licenceID", handler_view);
router.get("/:licenceID/edit", permissionHandlers.createGetHandler, handler_edit);
router.get("/:licenceID/print", handler_print);
router.get("/:licenceID/poke", permissionHandlers.adminGetHandler, handler_poke);
