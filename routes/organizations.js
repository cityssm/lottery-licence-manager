"use strict";
const express_1 = require("express");
const configFns = require("../helpers/configFns");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const licencesDB = require("../helpers/licencesDB");
const licencesDBOrganizations = require("../helpers/licencesDB-organizations");
const userFns_1 = require("../helpers/userFns");
const router = express_1.Router();
router.get("/", (_req, res) => {
    res.render("organization-search", {
        headTitle: "Organizations"
    });
});
router.post("/doSearch", (req, res) => {
    res.json(licencesDBOrganizations.getOrganizations(req.body, req.session, {
        limit: 100,
        offset: 0
    }));
});
router.all("/doGetAll", (req, res) => {
    res.json(licencesDBOrganizations.getOrganizations({}, req.session, {
        limit: -1
    }));
});
router.get("/reminders", (req, res) => {
    const reminders = licencesDBOrganizations.getUndismissedOrganizationReminders(req.session);
    res.render("organization-reminders", {
        headTitle: "Organization Reminders",
        reminders
    });
});
router.get("/cleanup", (req, res) => {
    if (!userFns_1.userCanUpdate(req)) {
        res.redirect("/organizations/?error=accessDenied");
        return;
    }
    res.render("organization-cleanup", {
        headTitle: "Organization Cleanup"
    });
});
router.post("/doGetInactive", (req, res) => {
    const inactiveYears = parseInt(req.body.inactiveYears, 10);
    res.json(licencesDBOrganizations.getInactiveOrganizations(inactiveYears));
});
router.get("/recovery", (req, res) => {
    if (!userFns_1.userIsAdmin(req)) {
        res.redirect("/organizations/?error=accessDenied");
        return;
    }
    const organizations = licencesDBOrganizations.getDeletedOrganizations();
    res.render("organization-recovery", {
        headTitle: "Organization Recovery",
        organizations
    });
});
router.post("/doGetRemarks", (req, res) => {
    const organizationID = req.body.organizationID;
    res.json(licencesDBOrganizations.getOrganizationRemarks(organizationID, req.session));
});
router.post("/doGetRemark", (req, res) => {
    const organizationID = req.body.organizationID;
    const remarkIndex = req.body.remarkIndex;
    res.json(licencesDBOrganizations.getOrganizationRemark(organizationID, remarkIndex, req.session));
});
router.post("/doAddRemark", (req, res) => {
    if (!userFns_1.userCanCreate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const remarkIndex = licencesDBOrganizations.addOrganizationRemark(req.body, req.session);
    res.json({
        success: true,
        message: "Remark added successfully.",
        remarkIndex
    });
});
router.post("/doEditRemark", (req, res) => {
    if (!userFns_1.userCanCreate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const success = licencesDBOrganizations.updateOrganizationRemark(req.body, req.session);
    if (success) {
        res.json({
            success: true,
            message: "Remark updated successfully."
        });
    }
    else {
        res.json({
            success: false,
            message: "Remark could not be updated."
        });
    }
});
router.post("/doDeleteRemark", (req, res) => {
    if (!userFns_1.userCanCreate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const organizationID = req.body.organizationID;
    const remarkIndex = req.body.remarkIndex;
    const success = licencesDBOrganizations.deleteOrganizationRemark(organizationID, remarkIndex, req.session);
    if (success) {
        res.json({
            success: true,
            message: "Remark deleted successfully."
        });
    }
    else {
        res.json({
            success: false,
            message: "Remark could not be deleted."
        });
    }
});
router.post("/doGetReminders", (req, res) => {
    const organizationID = req.body.organizationID;
    res.json(licencesDBOrganizations.getOrganizationReminders(organizationID, req.session));
});
router.post("/doGetReminder", (req, res) => {
    const organizationID = req.body.organizationID;
    const reminderIndex = req.body.reminderIndex;
    res.json(licencesDBOrganizations.getOrganizationReminder(organizationID, reminderIndex, req.session));
});
router.post("/doAddReminder", (req, res) => {
    if (!userFns_1.userCanCreate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const reminder = licencesDBOrganizations.addOrganizationReminder(req.body, req.session);
    if (reminder) {
        return res.json({
            success: true,
            reminder
        });
    }
    else {
        return res.json({
            success: false
        });
    }
});
router.post("/doEditReminder", (req, res) => {
    if (!userFns_1.userCanCreate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const success = licencesDBOrganizations.updateOrganizationReminder(req.body, req.session);
    if (success) {
        const reminder = licencesDBOrganizations.getOrganizationReminder(req.body.organizationID, req.body.reminderIndex, req.session);
        return res.json({
            success: true,
            reminder
        });
    }
    else {
        res.json({ success: false });
    }
});
router.post("/doDeleteReminder", (req, res) => {
    if (!userFns_1.userCanCreate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const success = licencesDBOrganizations
        .deleteOrganizationReminder(req.body.organizationID, req.body.reminderIndex, req.session);
    return res.json({ success });
});
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
router.post("/doAddBankRecord", (req, res) => {
    if (!userFns_1.userCanCreate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const success = licencesDBOrganizations.addOrganizationBankRecord(req.body, req.session);
    if (success) {
        return res.json({
            success: true,
            message: "Record added successfully."
        });
    }
    else {
        return res.json({
            success: false,
            message: "Please make sure that the record you are trying to create does not already exist."
        });
    }
});
router.post("/doEditBankRecord", (req, res) => {
    if (!userFns_1.userCanCreate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const success = licencesDBOrganizations.updateOrganizationBankRecord(req.body, req.session);
    if (success) {
        return res.json({
            success: true,
            message: "Record updated successfully."
        });
    }
    else {
        return res.json({
            success: false,
            message: "Please try again."
        });
    }
});
router.post("/doDeleteBankRecord", (req, res) => {
    if (!userFns_1.userCanCreate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const success = licencesDBOrganizations.deleteOrganizationBankRecord(req.body.organizationID, req.body.recordIndex, req.session);
    if (success) {
        res.json({
            success: true,
            message: "Organization updated successfully."
        });
    }
    else {
        res.json({
            success: false,
            message: "Record Not Saved"
        });
    }
});
router.get("/new", (req, res) => {
    if (!userFns_1.userCanCreate(req)) {
        res.redirect("/organizations/?error=accessDenied");
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
router.get("/:organizationID", (req, res) => {
    const organizationID = parseInt(req.params.organizationID, 10);
    const organization = licencesDBOrganizations.getOrganization(organizationID, req.session);
    if (!organization) {
        res.redirect("/organizations/?error=organizationNotFound");
        return;
    }
    const licences = licencesDB.getLicences({
        organizationID
    }, req.session, {
        includeOrganization: false,
        limit: -1
    }).licences || [];
    const remarks = licencesDBOrganizations.getOrganizationRemarks(organizationID, req.session) || [];
    const reminders = licencesDBOrganizations.getOrganizationReminders(organizationID, req.session) || [];
    res.render("organization-view", {
        headTitle: organization.organizationName,
        isViewOnly: true,
        organization,
        licences,
        remarks,
        reminders,
        currentDateInteger: dateTimeFns.dateToInteger(new Date())
    });
});
router.get("/:organizationID/edit", (req, res) => {
    const organizationID = parseInt(req.params.organizationID, 10);
    if (!userFns_1.userCanCreate(req)) {
        res.redirect("/organizations/" + organizationID.toString() + "/?error=accessDenied-noCreate");
        return;
    }
    const organization = licencesDBOrganizations.getOrganization(organizationID, req.session);
    if (!organization) {
        res.redirect("/organizations/?error=organizationNotFound");
        return;
    }
    if (!organization.canUpdate) {
        res.redirect("/organizations/" + organizationID.toString() + "/?error=accessDenied-noUpdate");
        return;
    }
    const licences = licencesDB.getLicences({
        organizationID
    }, req.session, {
        includeOrganization: false,
        limit: -1
    }).licences || [];
    const remarks = licencesDBOrganizations.getOrganizationRemarks(organizationID, req.session) || [];
    const reminders = licencesDBOrganizations.getOrganizationReminders(organizationID, req.session) || [];
    res.render("organization-edit", {
        headTitle: "Organization Update",
        isViewOnly: false,
        isCreate: false,
        organization,
        licences,
        remarks,
        reminders,
        currentDateInteger: dateTimeFns.dateToInteger(new Date())
    });
});
router.post("/:organizationID/doAddOrganizationRepresentative", (req, res) => {
    if (!userFns_1.userCanCreate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const organizationID = parseInt(req.params.organizationID, 10);
    const representativeObj = licencesDBOrganizations.addOrganizationRepresentative(organizationID, req.body);
    if (representativeObj) {
        res.json({
            success: true,
            organizationRepresentative: representativeObj
        });
    }
    else {
        res.json({
            success: false
        });
    }
});
router.post("/:organizationID/doEditOrganizationRepresentative", (req, res) => {
    if (!userFns_1.userCanCreate(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const organizationID = parseInt(req.params.organizationID, 10);
    const representativeObj = licencesDBOrganizations.updateOrganizationRepresentative(organizationID, req.body);
    if (representativeObj) {
        res.json({
            success: true,
            organizationRepresentative: representativeObj
        });
    }
    else {
        res.json({
            success: false
        });
    }
});
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
