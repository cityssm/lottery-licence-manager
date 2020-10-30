import { Router } from "express";

import * as permissionHandlers from "../handlers/permissions";

import { handler as handler_applicationSettings } from "../handlers/admin-get/applicationSettings";
import { handler as handler_doSaveApplicationSetting } from "../handlers/admin-post/doSaveApplicationSetting";

import { handler as handler_userManagement } from "../handlers/admin-get/userManagement";
import { handler as handler_doCreateUser } from "../handlers/admin-post/doCreateUser";
import { handler as handler_doUpdateUser } from "../handlers/admin-post/doUpdateUser";
import { handler as handler_doGetUserProperties } from "../handlers/admin-post/doGetUserProperties";
import { handler as handler_doUpdateUserProperty } from "../handlers/admin-post/doUpdateUserProperty";
import { handler as handler_doDeleteUser } from "../handlers/admin-post/doDeleteUser";
import { handler as handler_doResetPassword } from "../handlers/admin-post/doResetPassword";


const router = Router();


// Application Settings

router.get("/applicationSettings",
  permissionHandlers.adminGetHandler,
  handler_applicationSettings);


router.post("/doSaveApplicationSetting",
  permissionHandlers.adminPostHandler,
  handler_doSaveApplicationSetting);


// User Management


router.get("/userManagement",
  permissionHandlers.adminGetHandler,
  handler_userManagement);


router.post("/doCreateUser",
  permissionHandlers.adminPostHandler,
  handler_doCreateUser);


router.post("/doUpdateUser",
  permissionHandlers.adminPostHandler,
  handler_doUpdateUser);


router.post("/doUpdateUserProperty",
  permissionHandlers.adminPostHandler,
  handler_doUpdateUserProperty);


router.post("/doResetPassword",
  permissionHandlers.adminPostHandler,
  handler_doResetPassword);


router.post("/doGetUserProperties",
  permissionHandlers.adminPostHandler,
  handler_doGetUserProperties);


router.post("/doDeleteUser",
  permissionHandlers.adminPostHandler,
  handler_doDeleteUser);


export = router;
