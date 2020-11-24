"use strict";
const express_1 = require("express");
const configFns = require("../helpers/configFns");
const permissionHandlers = require("../handlers/permissions");
const cleanup_1 = require("../handlers/organizations-get/cleanup");
const view_1 = require("../handlers/organizations-get/view");
const edit_1 = require("../handlers/organizations-get/edit");
const doSearch_1 = require("../handlers/organizations-post/doSearch");
const doGetAll_1 = require("../handlers/organizations-all/doGetAll");
const doAddRepresentative_1 = require("../handlers/organizations-post/doAddRepresentative");
const doUpdateRepresentative_1 = require("../handlers/organizations-post/doUpdateRepresentative");
const doGetRemarks_1 = require("../handlers/organizations-post/doGetRemarks");
const doGetRemark_1 = require("../handlers/organizations-post/doGetRemark");
const doAddRemark_1 = require("../handlers/organizations-post/doAddRemark");
const doEditRemark_1 = require("../handlers/organizations-post/doEditRemark");
const doDeleteRemark_1 = require("../handlers/organizations-post/doDeleteRemark");
const reminders_1 = require("../handlers/organizations-get/reminders");
const doGetReminders_1 = require("../handlers/organizations-post/doGetReminders");
const doGetReminder_1 = require("../handlers/organizations-post/doGetReminder");
const doAddReminder_1 = require("../handlers/organizations-post/doAddReminder");
const doEditReminder_1 = require("../handlers/organizations-post/doEditReminder");
const doDismissReminder_1 = require("../handlers/organizations-post/doDismissReminder");
const doDeleteReminder_1 = require("../handlers/organizations-post/doDeleteReminder");
const doAddBankRecord_1 = require("../handlers/organizations-post/doAddBankRecord");
const doEditBankRecord_1 = require("../handlers/organizations-post/doEditBankRecord");
const doUpdateBankRecordsByMonth_1 = require("../handlers/organizations-post/doUpdateBankRecordsByMonth");
const doDeleteBankRecord_1 = require("../handlers/organizations-post/doDeleteBankRecord");
const doRollForward_1 = require("../handlers/organizations-post/doRollForward");
const licencesDBOrganizations = require("../helpers/licencesDB-organizations");
const userFns_1 = require("../helpers/userFns");
const router = express_1.Router();
const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");
router.get("/", (_req, res) => {
    res.render("organization-search", {
        headTitle: "Organizations"
    });
});
router.post("/doSearch", doSearch_1.handler);
router.all("/doGetAll", doGetAll_1.handler);
router.get("/reminders", reminders_1.handler);
router.get("/cleanup", permissionHandlers.updateGetHandler, cleanup_1.handler);
router.post("/doGetInactive", (req, res) => {
    const inactiveYears = parseInt(req.body.inactiveYears, 10);
    res.json(licencesDBOrganizations.getInactiveOrganizations(inactiveYears));
});
router.get("/recovery", (req, res) => {
    if (!userFns_1.userIsAdmin(req)) {
        res.redirect(urlPrefix + "/organizations/?error=accessDenied");
        return;
    }
    const organizations = licencesDBOrganizations.getDeletedOrganizations();
    res.render("organization-recovery", {
        headTitle: "Organization Recovery",
        organizations
    });
});
router.post("/doGetRemarks", doGetRemarks_1.handler);
router.post("/doGetRemark", doGetRemark_1.handler);
router.post("/doAddRemark", permissionHandlers.createPostHandler, doAddRemark_1.handler);
router.post("/doEditRemark", permissionHandlers.createPostHandler, doEditRemark_1.handler);
router.post("/doDeleteRemark", permissionHandlers.createPostHandler, doDeleteRemark_1.handler);
router.post("/doGetReminders", doGetReminders_1.handler);
router.post("/doGetReminder", doGetReminder_1.handler);
router.post("/doAddReminder", permissionHandlers.createPostHandler, doAddReminder_1.handler);
router.post("/doEditReminder", permissionHandlers.createPostHandler, doEditReminder_1.handler);
router.post("/doDismissReminder", permissionHandlers.createPostHandler, doDismissReminder_1.handler);
router.post("/doDeleteReminder", permissionHandlers.createPostHandler, doDeleteReminder_1.handler);
router.post("/doGetBankRecords", (req, res) => {
    const organizationID = req.body.organizationID;
    const bankingYear = req.body.bankingYear;
    const accountNumber = req.body.accountNumber;
    res.json(licencesDBOrganizations.getOrganizationBankRecords(organizationID, accountNumber, bankingYear));
});
router.post("/doGetBankRecordStats", (req, res) => {
    const organizationID = req.body.organizationID;
    res.json(licencesDBOrganizations.getOrganizationBankRecordStats(organizationID));
});
router.post("/doAddBankRecord", permissionHandlers.createPostHandler, doAddBankRecord_1.handler);
router.post("/doEditBankRecord", permissionHandlers.createPostHandler, doEditBankRecord_1.handler);
router.post("/doUpdateBankRecordsByMonth", permissionHandlers.createPostHandler, doUpdateBankRecordsByMonth_1.handler);
router.post("/doDeleteBankRecord", permissionHandlers.createPostHandler, doDeleteBankRecord_1.handler);
router.get("/new", (req, res) => {
    if (!userFns_1.userCanCreate(req)) {
        res.redirect(urlPrefix + "/organizations/?error=accessDenied");
        return;
    }
    res.render("organization-edit", {
        headTitle: "Organization Create",
        isViewOnly: false,
        isCreate: true,
        organization: {
            organizationCity: configFns.getProperty("defaults.city"),
            organizationProvince: configFns.getProperty("defaults.province")
        }
    });
});
router.post("/doSave", (req, res) => {
    if (!userFns_1.userCanCreate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    if (req.body.organizationID === "") {
        const newOrganizationID = licencesDBOrganizations.createOrganization(req.body, req.session);
        res.json({
            success: true,
            organizationID: newOrganizationID
        });
    }
    else {
        const success = licencesDBOrganizations.updateOrganization(req.body, req.session);
        if (success) {
            return res.json({
                success: true,
                message: "Organization updated successfully."
            });
        }
        else {
            return res.json({
                success: false,
                message: "Record Not Saved"
            });
        }
    }
});
router.post("/doDelete", (req, res) => {
    if (!userFns_1.userCanCreate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const success = licencesDBOrganizations.deleteOrganization(req.body.organizationID, req.session);
    if (success) {
        return res.json({
            success: true,
            message: "Organization deleted successfully."
        });
    }
    else {
        return res.json({
            success: false,
            message: "Organization could not be deleted."
        });
    }
});
router.post("/doRestore", (req, res) => {
    if (!userFns_1.userCanUpdate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const success = licencesDBOrganizations.restoreOrganization(req.body.organizationID, req.session);
    if (success) {
        return res.json({
            success: true,
            message: "Organization restored successfully."
        });
    }
    else {
        return res.json({
            success: false,
            message: "Organization could not be restored."
        });
    }
});
router.post("/doRollForward", permissionHandlers.createPostHandler, doRollForward_1.handler);
router.get("/:organizationID", view_1.handler);
router.get("/:organizationID/edit", permissionHandlers.createGetHandler, edit_1.handler);
router.post("/:organizationID/doAddOrganizationRepresentative", permissionHandlers.createPostHandler, doAddRepresentative_1.handler);
router.post("/:organizationID/doEditOrganizationRepresentative", permissionHandlers.createPostHandler, doUpdateRepresentative_1.handler);
router.post("/:organizationID/doDeleteOrganizationRepresentative", (req, res) => {
    if (!userFns_1.userCanCreate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const organizationID = parseInt(req.params.organizationID, 10);
    const representativeIndex = req.body.representativeIndex;
    const success = licencesDBOrganizations.deleteOrganizationRepresentative(organizationID, representativeIndex);
    res.json({
        success
    });
});
router.post("/:organizationID/doSetDefaultRepresentative", (req, res) => {
    if (!userFns_1.userCanCreate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const organizationID = parseInt(req.params.organizationID, 10);
    const isDefaultRepresentativeIndex = req.body.isDefaultRepresentativeIndex;
    const success = licencesDBOrganizations.setDefaultOrganizationRepresentative(organizationID, isDefaultRepresentativeIndex);
    res.json({
        success
    });
});
module.exports = router;
