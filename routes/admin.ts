import { Router } from "express";

import * as permissionHandlers from "../handlers/permissions.js";

import { handler as handler_applicationSettings } from "../handlers/admin-get/applicationSettings.js";
import { handler as handler_doSaveApplicationSetting } from "../handlers/admin-post/doSaveApplicationSetting.js";

import { handler as handler_userManagement } from "../handlers/admin-get/userManagement.js";
import { handler as handler_doCreateUser } from "../handlers/admin-post/doCreateUser.js";
import { handler as handler_doUpdateUser } from "../handlers/admin-post/doUpdateUser.js";
import { handler as handler_doGetUserProperties } from "../handlers/admin-post/doGetUserProperties.js";
import { handler as handler_doUpdateUserProperty } from "../handlers/admin-post/doUpdateUserProperty.js";
import { handler as handler_doDeleteUser } from "../handlers/admin-post/doDeleteUser.js";
import { handler as handler_doResetPassword } from "../handlers/admin-post/doResetPassword.js";


export const router = Router();


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
