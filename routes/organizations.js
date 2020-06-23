"use strict";
const express_1 = require("express");
const router = express_1.Router();
const configFns = require("../helpers/configFns");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const licencesDB = require("../helpers/licencesDB");
const licencesDBOrganizations = require("../helpers/licencesDB-organizations");
router.get("/", function (_req, res) {
    res.render("organization-search", {
        headTitle: "Organizations"
    });
});
router.post("/doSearch", function (req, res) {
    res.json(licencesDBOrganizations.getOrganizations(req.body, req.session, {
        limit: 100,
        offset: 0
    }));
});
router.all("/doGetAll", function (req, res) {
    res.json(licencesDBOrganizations.getOrganizations({}, req.session, {
        limit: -1
    }));
});
router.get("/cleanup", function (req, res) {
    if (!req.session.user.userProperties.canUpdate) {
        res.redirect("/organizations/?error=accessDenied");
        return;
    }
    res.render("organization-cleanup", {
        headTitle: "Organization Cleanup"
    });
});
router.post("/doGetInactive", function (req, res) {
    const inactiveYears = parseInt(req.body.inactiveYears, 10);
    res.json(licencesDBOrganizations.getInactiveOrganizations(inactiveYears));
});
router.get("/recovery", function (req, res) {
    if (!req.session.user.userProperties.isAdmin) {
        res.redirect("/organizations/?error=accessDenied");
        return;
    }
    const organizations = licencesDBOrganizations.getDeletedOrganizations();
    res.render("organization-recovery", {
        headTitle: "Organization Recovery",
        organizations: organizations
    });
});
router.post("/doGetRemarks", function (req, res) {
    const organizationID = req.body.organizationID;
    res.json(licencesDBOrganizations.getOrganizationRemarks(organizationID, req.session));
});
router.post("/doGetRemark", function (req, res) {
    const organizationID = req.body.organizationID;
    const remarkIndex = req.body.remarkIndex;
    res.json(licencesDBOrganizations.getOrganizationRemark(organizationID, remarkIndex, req.session));
});
router.post("/doAddRemark", function (req, res) {
    if (!req.session.user.userProperties.canCreate) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    const remarkIndex = licencesDBOrganizations.addOrganizationRemark(req.body, req.session);
    res.json({
        success: true,
        message: "Remark added successfully.",
        remarkIndex: remarkIndex
    });
});
router.post("/doEditRemark", function (req, res) {
    if (!req.session.user.userProperties.canCreate) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
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
router.post("/doDeleteRemark", function (req, res) {
    if (!req.session.user.userProperties.canCreate) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
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
router.post("/doGetBankRecords", function (req, res) {
    const organizationID = req.body.organizationID;
    const bankingYear = req.body.bankingYear;
    const accountNumber = req.body.accountNumber;
    res.json(licencesDBOrganizations.getOrganizationBankRecords(organizationID, accountNumber, bankingYear));
});
router.post("/doGetBankRecordStats", function (req, res) {
    const organizationID = req.body.organizationID;
    res.json(licencesDBOrganizations.getOrganizationBankRecordStats(organizationID));
});
router.post("/doAddBankRecord", function (req, res) {
    if (!req.session.user.userProperties.canCreate) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    const success = licencesDBOrganizations.addOrganizationBankRecord(req.body, req.session);
    if (success) {
        res.json({
            success: true,
            message: "Record added successfully."
        });
    }
    else {
        res.json({
            success: false,
            message: "Please make sure that the record you are trying to create does not already exist."
        });
    }
});
router.post("/doEditBankRecord", function (req, res) {
    if (!req.session.user.userProperties.canCreate) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    const success = licencesDBOrganizations.updateOrganizationBankRecord(req.body, req.session);
    if (success) {
        res.json({
            success: true,
            message: "Record updated successfully."
        });
    }
    else {
        res.json({
            success: false,
            message: "Please try again."
        });
    }
});
router.post("/doDeleteBankRecord", function (req, res) {
    if (!req.session.user.userProperties.canCreate) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
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
router.get("/new", function (req, res) {
    if (!req.session.user.userProperties.canCreate) {
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
router.post("/doSave", function (req, res) {
    if (!req.session.user.userProperties.canCreate) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
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
    if (!req.session.user.userProperties.canCreate) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    const success = licencesDBOrganizations.deleteOrganization(req.body.organizationID, req.session);
    if (success) {
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
    if (!req.session.user.userProperties.canUpdate) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    const success = licencesDBOrganizations.restoreOrganization(req.body.organizationID, req.session);
    if (success) {
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
    const organizationID = parseInt(req.params.organizationID, 10);
    const organization = licencesDBOrganizations.getOrganization(organizationID, req.session);
    if (!organization) {
        res.redirect("/organizations/?error=organizationNotFound");
        return;
    }
    const licences = licencesDB.getLicences({
        organizationID: organizationID
    }, req.session, {
        includeOrganization: false,
        limit: -1
    }).licences || [];
    const remarks = licencesDBOrganizations.getOrganizationRemarks(organizationID, req.session) || [];
    res.render("organization-view", {
        headTitle: organization.organizationName,
        isViewOnly: true,
        organization: organization,
        licences: licences,
        remarks: remarks,
        currentDateInteger: dateTimeFns.dateToInteger(new Date())
    });
});
router.get("/:organizationID/edit", function (req, res) {
    const organizationID = parseInt(req.params.organizationID, 10);
    if (!req.session.user.userProperties.canCreate) {
        res.redirect("/organizations/" + organizationID + "/?error=accessDenied-noCreate");
        return;
    }
    const organization = licencesDBOrganizations.getOrganization(organizationID, req.session);
    if (!organization) {
        res.redirect("/organizations/?error=organizationNotFound");
        return;
    }
    if (!organization.canUpdate) {
        res.redirect("/organizations/" + organizationID + "/?error=accessDenied-noUpdate");
        return;
    }
    const licences = licencesDB.getLicences({
        organizationID: organizationID
    }, req.session, {
        includeOrganization: false,
        limit: -1
    }).licences || [];
    const remarks = licencesDBOrganizations.getOrganizationRemarks(organizationID, req.session) || [];
    res.render("organization-edit", {
        headTitle: "Organization Update",
        isViewOnly: false,
        isCreate: false,
        organization: organization,
        licences: licences,
        remarks: remarks,
        currentDateInteger: dateTimeFns.dateToInteger(new Date())
    });
});
router.post("/:organizationID/doAddOrganizationRepresentative", function (req, res) {
    if (!req.session.user.userProperties.canCreate) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
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
router.post("/:organizationID/doEditOrganizationRepresentative", function (req, res) {
    if (!req.session.user.userProperties.canCreate) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
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
router.post("/:organizationID/doDeleteOrganizationRepresentative", function (req, res) {
    if (!req.session.user.userProperties.canCreate) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    const organizationID = parseInt(req.params.organizationID, 10);
    const representativeIndex = req.body.representativeIndex;
    const success = licencesDBOrganizations.deleteOrganizationRepresentative(organizationID, representativeIndex);
    res.json({
        success: success
    });
});
router.post("/:organizationID/doSetDefaultRepresentative", function (req, res) {
    if (!req.session.user.userProperties.canCreate) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    const organizationID = parseInt(req.params.organizationID, 10);
    const isDefaultRepresentativeIndex = req.body.isDefaultRepresentativeIndex;
    const success = licencesDBOrganizations.setDefaultOrganizationRepresentative(organizationID, isDefaultRepresentativeIndex);
    res.json({
        success: success
    });
});
module.exports = router;
