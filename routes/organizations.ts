import { Router } from "express";

import * as configFns from "../helpers/configFns";

import * as permissionHandlers from "../handlers/permissions";

import { handler as handler_cleanup } from "../handlers/organizations-get/cleanup";
import { handler as handler_view } from "../handlers/organizations-get/view";
import { handler as handler_edit } from "../handlers/organizations-get/edit";

import { handler as handler_doSearch } from "../handlers/organizations-post/doSearch";
import { handler as handler_doGetAll } from "../handlers/organizations-all/doGetAll";

import { handler as handler_doAddRepresentative } from "../handlers/organizations-post/doAddRepresentative";
import { handler as handler_doUpdateRepresentative } from "../handlers/organizations-post/doUpdateRepresentative";

import { handler as handler_doGetRemarks } from "../handlers/organizations-post/doGetRemarks";
import { handler as handler_doGetRemark } from "../handlers/organizations-post/doGetRemark";
import { handler as handler_doAddRemark } from "../handlers/organizations-post/doAddRemark";
import { handler as handler_doEditRemark } from "../handlers/organizations-post/doEditRemark";
import { handler as handler_doDeleteRemark } from "../handlers/organizations-post/doDeleteRemark";

import { handler as handler_reminders } from "../handlers/organizations-get/reminders";
import { handler as handler_doGetReminders } from "../handlers/organizations-post/doGetReminders";
import { handler as handler_doGetReminder } from "../handlers/organizations-post/doGetReminder";
import { handler as handler_doAddReminder } from "../handlers/organizations-post/doAddReminder";
import { handler as handler_doEditReminder } from "../handlers/organizations-post/doEditReminder";
import { handler as handler_doDismissReminder } from "../handlers/organizations-post/doDismissReminder";
import { handler as handler_doDeleteReminder } from "../handlers/organizations-post/doDeleteReminder";

import { handler as handler_doAddBankRecord } from "../handlers/organizations-post/doAddBankRecord";
import { handler as handler_doEditBankRecord } from "../handlers/organizations-post/doEditBankRecord";
import { handler as handler_doUpdateBankRecordsByMonth } from "../handlers/organizations-post/doUpdateBankRecordsByMonth";
import { handler as handler_doDeleteBankRecord } from "../handlers/organizations-post/doDeleteBankRecord";

import { handler as handler_doRollForward } from "../handlers/organizations-post/doRollForward";

import * as licencesDBOrganizations from "../helpers/licencesDB-organizations";


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
  handler_doSearch);


router.all("/doGetAll",
  handler_doGetAll);


/*
 * ACTIVE REMINDERS
 */


router.get("/reminders",
  handler_reminders);


/*
 * CLEANUP
 */


router.get("/cleanup",
  permissionHandlers.updateGetHandler,
  handler_cleanup);


router.post("/doGetInactive", (req, res) => {

  const inactiveYears = parseInt(req.body.inactiveYears, 10);

  res.json(licencesDBOrganizations.getInactiveOrganizations(inactiveYears));

});


/*
 * RECOVERY
 */


router.get("/recovery", permissionHandlers.adminGetHandler, (_req, res) => {

  const organizations = licencesDBOrganizations.getDeletedOrganizations();

  res.render("organization-recovery", {
    headTitle: "Organization Recovery",
    organizations
  });
});


/*
 * REMARKS
 */


router.post("/doGetRemarks", handler_doGetRemarks);


router.post("/doGetRemark", handler_doGetRemark);


router.post("/doAddRemark",
  permissionHandlers.createPostHandler,
  handler_doAddRemark);


router.post("/doEditRemark",
  permissionHandlers.createPostHandler,
  handler_doEditRemark);


router.post("/doDeleteRemark",
  permissionHandlers.createPostHandler,
  handler_doDeleteRemark);


/*
 * REMINDERS
 */


router.post("/doGetReminders", handler_doGetReminders);


router.post("/doGetReminder", handler_doGetReminder);


router.post("/doAddReminder",
  permissionHandlers.createPostHandler,
  handler_doAddReminder);


router.post("/doEditReminder",
  permissionHandlers.createPostHandler,
  handler_doEditReminder);


router.post("/doDismissReminder",
  permissionHandlers.createPostHandler,
  handler_doDismissReminder);


router.post("/doDeleteReminder",
  permissionHandlers.createPostHandler,
  handler_doDeleteReminder);


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


router.post("/doAddBankRecord",
  permissionHandlers.createPostHandler,
  handler_doAddBankRecord);


router.post("/doEditBankRecord",
  permissionHandlers.createPostHandler,
  handler_doEditBankRecord);


router.post("/doUpdateBankRecordsByMonth",
  permissionHandlers.createPostHandler,
  handler_doUpdateBankRecordsByMonth);


router.post("/doDeleteBankRecord",
  permissionHandlers.createPostHandler,
  handler_doDeleteBankRecord);


/*
 * ORGANIZATION MAINTENANCE
 */


router.get("/new", permissionHandlers.createGetHandler, (_req, res) => {

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


router.post("/doSave", permissionHandlers.createPostHandler, (req, res) => {

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


router.post("/doDelete", permissionHandlers.createPostHandler, (req, res) => {

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


router.post("/doRestore", permissionHandlers.updatePostHandler, (req, res) => {

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


router.post("/doRollForward",
  permissionHandlers.createPostHandler,
  handler_doRollForward);


/*
 * VIEW
 */


router.get("/:organizationID",
  handler_view);


/*
 * CREATE / EDIT
 */


router.get("/:organizationID/edit",
  permissionHandlers.createGetHandler,
  handler_edit);


router.post("/:organizationID/doAddOrganizationRepresentative",
  permissionHandlers.createPostHandler,
  handler_doAddRepresentative);

router.post("/:organizationID/doEditOrganizationRepresentative",
  permissionHandlers.createPostHandler,
  handler_doUpdateRepresentative);


router.post("/:organizationID/doDeleteOrganizationRepresentative",
  permissionHandlers.createPostHandler,
  (req, res) => {

    const organizationID = parseInt(req.params.organizationID, 10);
    const representativeIndex = req.body.representativeIndex;

    const success = licencesDBOrganizations.deleteOrganizationRepresentative(organizationID, representativeIndex);

    res.json({
      success
    });
  });


router.post("/:organizationID/doSetDefaultRepresentative", permissionHandlers.createPostHandler, (req, res) => {

  const organizationID = parseInt(req.params.organizationID, 10);
  const isDefaultRepresentativeIndex = req.body.isDefaultRepresentativeIndex;

  const success =
    licencesDBOrganizations.setDefaultOrganizationRepresentative(organizationID, isDefaultRepresentativeIndex);

  res.json({
    success
  });
});


export = router;
