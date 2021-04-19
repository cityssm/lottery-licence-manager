import { Router } from "express";

import * as permissionHandlers from "../handlers/permissions.js";

import { handler as handler_cleanup } from "../handlers/organizations-get/cleanup.js";
import { handler as handler_new } from "../handlers/organizations-get/new.js";
import { handler as handler_view } from "../handlers/organizations-get/view.js";
import { handler as handler_edit } from "../handlers/organizations-get/edit.js";

import { handler as handler_doSearch } from "../handlers/organizations-post/doSearch.js";
import { handler as handler_doGetAll } from "../handlers/organizations-all/doGetAll.js";

import { handler as handler_doSave } from "../handlers/organizations-post/doSave.js";
import { handler as handler_doDelete } from "../handlers/organizations-post/doDelete.js";
import { handler as handler_doRestore } from "../handlers/organizations-post/doRestore.js";

import { handler as handler_doAddRepresentative } from "../handlers/organizations-post/doAddRepresentative.js";
import { handler as handler_doUpdateRepresentative } from "../handlers/organizations-post/doUpdateRepresentative.js";
import { handler as handler_doDeleteRepresentative } from "../handlers/organizations-post/doDeleteRepresentative.js";
import { handler as handler_doSetDefaultRepresentative } from "../handlers/organizations-post/doSetDefaultRepresentative.js";

import { handler as handler_doGetRemarks } from "../handlers/organizations-post/doGetRemarks.js";
import { handler as handler_doGetRemark } from "../handlers/organizations-post/doGetRemark.js";
import { handler as handler_doAddRemark } from "../handlers/organizations-post/doAddRemark.js";
import { handler as handler_doEditRemark } from "../handlers/organizations-post/doEditRemark.js";
import { handler as handler_doDeleteRemark } from "../handlers/organizations-post/doDeleteRemark.js";

import { handler as handler_reminders } from "../handlers/organizations-get/reminders.js";
import { handler as handler_doGetReminders } from "../handlers/organizations-post/doGetReminders.js";
import { handler as handler_doGetReminder } from "../handlers/organizations-post/doGetReminder.js";
import { handler as handler_doAddReminder } from "../handlers/organizations-post/doAddReminder.js";
import { handler as handler_doEditReminder } from "../handlers/organizations-post/doEditReminder.js";
import { handler as handler_doDismissReminder } from "../handlers/organizations-post/doDismissReminder.js";
import { handler as handler_doDeleteReminder } from "../handlers/organizations-post/doDeleteReminder.js";

import { handler as handler_doGetBankRecords } from "../handlers/organizations-post/doGetBankRecords.js";
import { handler as handler_doAddBankRecord } from "../handlers/organizations-post/doAddBankRecord.js";
import { handler as handler_doEditBankRecord } from "../handlers/organizations-post/doEditBankRecord.js";
import { handler as handler_doUpdateBankRecordsByMonth } from "../handlers/organizations-post/doUpdateBankRecordsByMonth.js";
import { handler as handler_doDeleteBankRecord } from "../handlers/organizations-post/doDeleteBankRecord.js";
import { handler as handler_doGetBankRecordStats } from "../handlers/organizations-post/doGetBankRecordStats.js";

import { handler as handler_doRollForward } from "../handlers/organizations-post/doRollForward.js";

import { handler as handler_doGetInactive } from "../handlers/organizations-post/doGetInactive.js";

import { handler as handler_recovery } from "../handlers/organizations-get/recovery.js";


export const router = Router();


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


router.post("/doGetInactive",
  permissionHandlers.updatePostHandler,
  handler_doGetInactive);


/*
 * RECOVERY
 */


router.get("/recovery",
  permissionHandlers.adminGetHandler,
  handler_recovery);


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


router.post("/doGetBankRecords", handler_doGetBankRecords);


router.post("/doGetBankRecordStats", handler_doGetBankRecordStats);


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


router.get("/new",
  permissionHandlers.createGetHandler,
  handler_new);


router.post("/doSave",
  permissionHandlers.createPostHandler,
  handler_doSave);


router.post("/doDelete",
  permissionHandlers.createPostHandler,
  handler_doDelete);


router.post("/doRestore",
  permissionHandlers.updatePostHandler,
  handler_doRestore);


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
  handler_doDeleteRepresentative);


router.post("/:organizationID/doSetDefaultRepresentative",
  permissionHandlers.createPostHandler,
  handler_doSetDefaultRepresentative);
