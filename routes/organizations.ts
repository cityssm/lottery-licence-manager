import { Router } from "express";

import * as configFns from "../helpers/configFns";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";

import * as licencesDB from "../helpers/licencesDB";
import * as licencesDBOrganizations from "../helpers/licencesDB-organizations";

import { userCanCreate, userCanUpdate, userIsAdmin, forbiddenJSON } from "../helpers/userFns";


const router = Router();


/*
 * SEARCH
 */


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


/*
 * CLEANUP
 */


router.get("/cleanup", (req, res) => {

  if (!userCanUpdate(req)) {

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


/*
 * RECOVERY
 */

router.get("/recovery", (req, res) => {

  if (!userIsAdmin(req)) {

    res.redirect("/organizations/?error=accessDenied");
    return;

  }

  const organizations = licencesDBOrganizations.getDeletedOrganizations();

  res.render("organization-recovery", {
    headTitle: "Organization Recovery",
    organizations
  });

});


/*
 * REMARKS
 */


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

  if (!userCanCreate(req)) {
    return forbiddenJSON(res);
  }

  const remarkIndex = licencesDBOrganizations.addOrganizationRemark(req.body, req.session);

  res.json({
    success: true,
    message: "Remark added successfully.",
    remarkIndex
  });

});


router.post("/doEditRemark", (req, res) => {

  if (!userCanCreate(req)) {
    return forbiddenJSON(res);
  }

  const success = licencesDBOrganizations.updateOrganizationRemark(req.body, req.session);

  if (success) {

    res.json({
      success: true,
      message: "Remark updated successfully."
    });

  } else {

    res.json({
      success: false,
      message: "Remark could not be updated."
    });
  }
});


router.post("/doDeleteRemark", (req, res) => {

  if (!userCanCreate(req)) {
    return forbiddenJSON(res);
  }

  const organizationID = req.body.organizationID;
  const remarkIndex = req.body.remarkIndex;

  const success = licencesDBOrganizations.deleteOrganizationRemark(organizationID, remarkIndex, req.session);

  if (success) {

    res.json({
      success: true,
      message: "Remark deleted successfully."
    });

  } else {

    res.json({
      success: false,
      message: "Remark could not be deleted."
    });

  }

});


/*
 * BANK RECORDS
 */


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

  if (!userCanCreate(req)) {
    return forbiddenJSON(res);
  }

  const success = licencesDBOrganizations.addOrganizationBankRecord(req.body, req.session);

  if (success) {

    return res.json({
      success: true,
      message: "Record added successfully."
    });

  } else {

    return res.json({
      success: false,
      message: "Please make sure that the record you are trying to create does not already exist."
    });

  }

});


router.post("/doEditBankRecord", (req, res) => {

  if (!userCanCreate(req)) {
    return forbiddenJSON(res);
  }

  const success = licencesDBOrganizations.updateOrganizationBankRecord(req.body, req.session);

  if (success) {

    return res.json({
      success: true,
      message: "Record updated successfully."
    });

  } else {

    return res.json({
      success: false,
      message: "Please try again."
    });

  }

});


router.post("/doDeleteBankRecord", (req, res) => {

  if (!userCanCreate(req)) {
    return forbiddenJSON(res);
  }

  const success =
    licencesDBOrganizations.deleteOrganizationBankRecord(req.body.organizationID, req.body.recordIndex, req.session);

  if (success) {
    res.json({
      success: true,
      message: "Organization updated successfully."
    });
  } else {
    res.json({
      success: false,
      message: "Record Not Saved"
    });
  }
});


router.get("/new", (req, res) => {

  if (!userCanCreate(req)) {

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

  if (!userCanCreate(req)) {
    return forbiddenJSON(res);
  }

  if (req.body.organizationID === "") {

    const newOrganizationID = licencesDBOrganizations.createOrganization(req.body, req.session);

    res.json({
      success: true,
      organizationID: newOrganizationID
    });

  } else {

    const success = licencesDBOrganizations.updateOrganization(req.body, req.session);

    if (success) {

      return res.json({
        success: true,
        message: "Organization updated successfully."
      });

    } else {

      return res.json({
        success: false,
        message: "Record Not Saved"
      });

    }
  }
});


router.post("/doDelete", (req, res) => {

  if (!userCanCreate(req)) {
    return forbiddenJSON(res);
  }

  const success = licencesDBOrganizations.deleteOrganization(req.body.organizationID, req.session);

  if (success) {

    return res.json({
      success: true,
      message: "Organization deleted successfully."
    });

  } else {

    return res.json({
      success: false,
      message: "Organization could not be deleted."
    });

  }

});


router.post("/doRestore", (req, res) => {

  if (!userCanUpdate(req)) {
    return forbiddenJSON(res);
  }

  const success = licencesDBOrganizations.restoreOrganization(req.body.organizationID, req.session);

  if (success) {

    return res.json({
      success: true,
      message: "Organization restored successfully."
    });

  } else {

    return res.json({
      success: false,
      message: "Organization could not be restored."
    });

  }

});


/*
 * VIEW
 */


router.get("/:organizationID", (req, res) => {

  const organizationID = parseInt(req.params.organizationID, 10);

  const organization = licencesDBOrganizations.getOrganization(organizationID, req.session);

  if (!organization) {

    res.redirect("/organizations/?error=organizationNotFound");
    return;

  }

  const licences = licencesDB.getLicences(
    {
      organizationID
    },
    req.session,
    {
      includeOrganization: false,
      limit: -1
    }).licences || [];

  const remarks = licencesDBOrganizations.getOrganizationRemarks(organizationID, req.session) || [];

  res.render("organization-view", {
    headTitle: organization.organizationName,
    isViewOnly: true,
    organization,
    licences,
    remarks,
    currentDateInteger: dateTimeFns.dateToInteger(new Date())
  });

});


/*
 * CREATE / EDIT
 */


router.get("/:organizationID/edit", (req, res) => {

  const organizationID = parseInt(req.params.organizationID, 10);

  if (!userCanCreate(req)) {

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

  const licences = licencesDB.getLicences(
    {
      organizationID
    },
    req.session,
    {
      includeOrganization: false,
      limit: -1
    }
  ).licences || [];

  const remarks = licencesDBOrganizations.getOrganizationRemarks(organizationID, req.session) || [];

  res.render("organization-edit", {
    headTitle: "Organization Update",
    isViewOnly: false,
    isCreate: false,
    organization,
    licences,
    remarks,
    currentDateInteger: dateTimeFns.dateToInteger(new Date())
  });

});


router.post("/:organizationID/doAddOrganizationRepresentative", (req, res) => {

  if (!userCanCreate(req)) {
    return forbiddenJSON(res);
  }

  const organizationID = parseInt(req.params.organizationID, 10);

  const representativeObj = licencesDBOrganizations.addOrganizationRepresentative(organizationID, req.body);

  if (representativeObj) {

    res.json({
      success: true,
      organizationRepresentative: representativeObj
    });

  } else {

    res.json({
      success: false
    });

  }

});


router.post("/:organizationID/doEditOrganizationRepresentative", (req, res) => {

  if (!userCanCreate(req)) {
    return forbiddenJSON(res);
  }

  const organizationID = parseInt(req.params.organizationID, 10);

  const representativeObj = licencesDBOrganizations.updateOrganizationRepresentative(organizationID, req.body);

  if (representativeObj) {

    res.json({
      success: true,
      organizationRepresentative: representativeObj
    });

  } else {

    res.json({
      success: false
    });

  }

});


router.post("/:organizationID/doDeleteOrganizationRepresentative", (req, res) => {

  if (!userCanCreate(req)) {
    return forbiddenJSON(res);
  }

  const organizationID = parseInt(req.params.organizationID, 10);
  const representativeIndex = req.body.representativeIndex;

  const success = licencesDBOrganizations.deleteOrganizationRepresentative(organizationID, representativeIndex);

  res.json({
    success
  });

});


router.post("/:organizationID/doSetDefaultRepresentative", (req, res) => {

  if (!userCanCreate(req)) {
    return forbiddenJSON(res);
  }

  const organizationID = parseInt(req.params.organizationID, 10);
  const isDefaultRepresentativeIndex = req.body.isDefaultRepresentativeIndex;

  const success =
    licencesDBOrganizations.setDefaultOrganizationRepresentative(organizationID, isDefaultRepresentativeIndex);

  res.json({
    success
  });

});


export = router;
