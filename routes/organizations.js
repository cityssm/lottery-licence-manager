"use strict";
const express = require("express");
const router = express.Router();
const configFns_1 = require("../helpers/configFns");
const dateTimeFns_1 = require("../helpers/dateTimeFns");
const stringFns_1 = require("../helpers/stringFns");
const licencesDB_1 = require("../helpers/licencesDB");
router.get("/", function (_req, res) {
    res.render("organization-search", {
        headTitle: "Organizations"
    });
});
router.post("/doSearch", function (req, res) {
    res.json(licencesDB_1.licencesDB.getOrganizations(req.body, true, req.session));
});
router.all("/doGetAll", function (req, res) {
    res.json(licencesDB_1.licencesDB.getOrganizations({}, false, req.session));
});
router.get("/cleanup", function (_req, res) {
    res.render("organization-cleanup", {
        headTitle: "Organization Cleanup"
    });
});
router.post("/doGetInactive", function (req, res) {
    const inactiveYears = parseInt(req.body.inactiveYears);
    res.json(licencesDB_1.licencesDB.getInactiveOrganizations(inactiveYears));
});
router.post("/doGetRemarks", function (req, res) {
    const organizationID = req.body.organizationID;
    res.json(licencesDB_1.licencesDB.getOrganizationRemarks(organizationID, req.session));
});
router.post("/doGetRemark", function (req, res) {
    const organizationID = req.body.organizationID;
    const remarkIndex = req.body.remarkIndex;
    res.json(licencesDB_1.licencesDB.getOrganizationRemark(organizationID, remarkIndex, req.session));
});
router.post("/doAddRemark", function (req, res) {
    if (req.session.user.userProperties.canCreate !== "true") {
        res.json("not allowed");
        return;
    }
    const remarkIndex = licencesDB_1.licencesDB.addOrganizationRemark(req.body, req.session);
    res.json({
        success: true,
        message: "Remark added successfully.",
        remarkIndex: remarkIndex
    });
});
router.post("/doEditRemark", function (req, res) {
    if (req.session.user.userProperties.canCreate !== "true") {
        res.json("not allowed");
        return;
    }
    const changeCount = licencesDB_1.licencesDB.updateOrganizationRemark(req.body, req.session);
    if (changeCount) {
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
router.post("/doDeleteRemark", function (req, res) {
    if (req.session.user.userProperties.canCreate !== "true") {
        res.json("not allowed");
        return;
    }
    const organizationID = req.body.organizationID;
    const remarkIndex = req.body.remarkIndex;
    const changeCount = licencesDB_1.licencesDB.deleteOrganizationRemark(organizationID, remarkIndex, req.session);
    if (changeCount) {
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
router.get("/new", function (req, res) {
    if (req.session.user.userProperties.canCreate !== "true") {
        res.redirect("/organizations/?error=accessDenied");
        return;
    }
    res.render("organization-edit", {
        headTitle: "Organization Create",
        isCreate: true,
        organization: {
            organizationCity: configFns_1.configFns.getProperty("defaults.city"),
            organizationProvince: configFns_1.configFns.getProperty("defaults.province")
        }
    });
});
router.post("/doSave", function (req, res) {
    if (req.session.user.userProperties.canCreate !== "true") {
        res.json("not allowed");
        return;
    }
    if (req.body.organizationID === "") {
        const newOrganizationID = licencesDB_1.licencesDB.createOrganization(req.body, req.session);
        res.json({
            success: true,
            organizationID: newOrganizationID
        });
    }
    else {
        const changeCount = licencesDB_1.licencesDB.updateOrganization(req.body, req.session);
        if (changeCount) {
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
    }
});
router.post("/doDelete", function (req, res) {
    if (req.session.user.userProperties.canCreate !== "true") {
        res.json({
            success: false,
            message: "Access denied."
        });
        return;
    }
    const changeCount = licencesDB_1.licencesDB.deleteOrganization(req.body.organizationID, req.session);
    if (changeCount) {
        res.json({
            success: true,
            message: "Organization deleted successfully."
        });
    }
    else {
        res.json({
            success: false,
            message: "Organization could not be deleted."
        });
    }
});
router.post("/doRestore", function (req, res) {
    if (req.session.user.userProperties.canUpdate !== "true") {
        res.json("not allowed");
        return;
    }
    const changeCount = licencesDB_1.licencesDB.restoreOrganization(req.body.organizationID, req.session);
    if (changeCount) {
        res.json({
            success: true,
            message: "Organization restored successfully."
        });
    }
    else {
        res.json({
            success: false,
            message: "Organization could not be restored."
        });
    }
});
router.get("/:organizationID", function (req, res) {
    const organizationID = parseInt(req.params.organizationID);
    const organization = licencesDB_1.licencesDB.getOrganization(organizationID, req.session);
    if (!organization) {
        res.redirect("/organizations/?error=organizationNotFound");
        return;
    }
    const licences = licencesDB_1.licencesDB.getLicences({
        organizationID: organizationID
    }, false, false, req.session) || [];
    const remarks = licencesDB_1.licencesDB.getOrganizationRemarks(organizationID, req.session) || [];
    res.render("organization-view", {
        headTitle: organization.organizationName,
        organization: organization,
        licences: licences,
        remarks: remarks,
        currentDateInteger: dateTimeFns_1.dateTimeFns.dateToInteger(new Date()),
        stringFns: stringFns_1.stringFns
    });
});
router.get("/:organizationID/edit", function (req, res) {
    const organizationID = parseInt(req.params.organizationID);
    if (req.session.user.userProperties.canCreate !== "true") {
        res.redirect("/organizations/" + organizationID + "/?error=accessDenied-noCreate");
        return;
    }
    const organization = licencesDB_1.licencesDB.getOrganization(organizationID, req.session);
    if (!organization) {
        res.redirect("/organizations/?error=organizationNotFound");
        return;
    }
    if (!organization.canUpdate) {
        res.redirect("/organizations/" + organizationID + "/?error=accessDenied-noUpdate");
        return;
    }
    const licences = licencesDB_1.licencesDB.getLicences({
        organizationID: organizationID
    }, false, false, req.session) || [];
    const remarks = licencesDB_1.licencesDB.getOrganizationRemarks(organizationID, req.session) || [];
    res.render("organization-edit", {
        headTitle: "Organization Update",
        isCreate: false,
        organization: organization,
        licences: licences,
        remarks: remarks,
        currentDateInteger: dateTimeFns_1.dateTimeFns.dateToInteger(new Date()),
        stringFns: stringFns_1.stringFns
    });
});
router.post("/:organizationID/doAddOrganizationRepresentative", function (req, res) {
    if (req.session.user.userProperties.canCreate !== "true") {
        res.json("not allowed");
        return;
    }
    const organizationID = parseInt(req.params.organizationID);
    const representativeObj = licencesDB_1.licencesDB.addOrganizationRepresentative(organizationID, req.body);
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
router.post("/:organizationID/doEditOrganizationRepresentative", function (req, res) {
    if (req.session.user.userProperties.canCreate !== "true") {
        res.json("not allowed");
        return;
    }
    const organizationID = parseInt(req.params.organizationID);
    const representativeObj = licencesDB_1.licencesDB.updateOrganizationRepresentative(organizationID, req.body);
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
router.post("/:organizationID/doDeleteOrganizationRepresentative", function (req, res) {
    if (req.session.user.userProperties.canCreate !== "true") {
        res.json("not allowed");
        return;
    }
    const organizationID = parseInt(req.params.organizationID);
    const representativeIndex = req.body.representativeIndex;
    const success = licencesDB_1.licencesDB.deleteOrganizationRepresentative(organizationID, representativeIndex);
    res.json({
        success: success
    });
});
router.post("/:organizationID/doSetDefaultRepresentative", function (req, res) {
    if (req.session.user.userProperties.canCreate !== "true") {
        res.json("not allowed");
        return;
    }
    const organizationID = parseInt(req.params.organizationID);
    const isDefaultRepresentativeIndex = req.body.isDefaultRepresentativeIndex;
    const success = licencesDB_1.licencesDB.setDefaultOrganizationRepresentative(organizationID, isDefaultRepresentativeIndex);
    res.json({
        success: success
    });
});
module.exports = router;
