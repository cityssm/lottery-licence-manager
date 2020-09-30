import { Router } from "express";

import * as configFns from "../helpers/configFns";

import * as permissionHandlers from "../handlers/permissions";

import * as handler_cleanup from "../handlers/organizations-get/cleanup";
import * as handler_view from "../handlers/organizations-get/view";
import * as handler_edit from "../handlers/organizations-get/edit";

import * as handler_doSearch from "../handlers/organizations-post/doSearch";
import * as handler_doGetAll from "../handlers/organizations-all/doGetAll";

import * as handler_doGetRemarks from "../handlers/organizations-post/doGetRemarks";
import * as handler_doAddRemark from "../handlers/organizations-post/doAddRemark";

import * as handler_reminders from "../handlers/organizations-get/reminders";
import * as handler_doGetReminders from "../handlers/organizations-post/doGetReminders";
import * as handler_doAddReminder from "../handlers/organizations-post/doAddReminder";
import * as handler_doDeleteReminder from "../handlers/organizations-post/doDeleteReminder";

import * as handler_doRollForward from "../handlers/organizations-post/doRollForward";

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


router.post("/doSearch",
  handler_doSearch.handler);


router.all("/doGetAll",
  handler_doGetAll.handler);


/*
 * ACTIVE REMINDERS
 */


router.get("/reminders",
  handler_reminders.handler);


/*
 * CLEANUP
 */


router.get("/cleanup",
  permissionHandlers.updateGetHandler,
  handler_cleanup.handler);


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


router.post("/doGetRemarks", handler_doGetRemarks.handler);


router.post("/doGetRemark", (req, res) => {

  const organizationID = req.body.organizationID;
  const remarkIndex = req.body.remarkIndex;

  res.json(licencesDBOrganizations.getOrganizationRemark(organizationID, remarkIndex, req.session));

});


router.post("/doAddRemark", permissionHandlers.createPostHandler, handler_doAddRemark.handler);


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
 * REMINDERS
 */


router.post("/doGetReminders", handler_doGetReminders.handler);


router.post("/doGetReminder", (req, res) => {

  const organizationID = req.body.organizationID;
  const reminderIndex = req.body.reminderIndex;

  res.json(licencesDBOrganizations.getOrganizationReminder(organizationID, reminderIndex, req.session));
});


router.post("/doAddReminder", permissionHandlers.createPostHandler, handler_doAddReminder.handler);


router.post("/doEditReminder", (req, res) => {

  if (!userCanCreate(req)) {
    return forbiddenJSON(res);
  }

  const success = licencesDBOrganizations.updateOrganizationReminder(req.body, req.session);

  if (success) {

    const reminder =
      licencesDBOrganizations.getOrganizationReminder(req.body.organizationID, req.body.reminderIndex, req.session);

    return res.json({
      success: true,
      reminder
    });

  } else {
    res.json({ success: false });
  }
});


router.post("/doDismissReminder", (req, res) => {

  if (!userCanCreate(req)) {
    return forbiddenJSON(res);
  }

  const organizationID = req.body.organizationID;
  const reminderIndex = req.body.reminderIndex;

  const success = licencesDBOrganizations.dismissOrganizationReminder(organizationID, reminderIndex, req.session);

  if (success) {

    const reminder =
      licencesDBOrganizations.getOrganizationReminder(req.body.organizationID, req.body.reminderIndex, req.session);

    res.json({
      success: true,
      message: "Reminder dismissed.",
      reminder
    });

  } else {

    res.json({
      success: false,
      message: "Reminder could not be dismissed."
    });

  }

});


router.post("/doDeleteReminder", permissionHandlers.createPostHandler, handler_doDeleteReminder.handler);


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


/*
 * ORGANIZATION MAINTENANCE
 */


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


router.post("/doRollForward", permissionHandlers.createPostHandler, handler_doRollForward.handler);


/*
 * VIEW
 */


router.get("/:organizationID",
  handler_view.handler);


/*
 * CREATE / EDIT
 */


router.get("/:organizationID/edit",
  permissionHandlers.createGetHandler,
  handler_edit.handler);


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
