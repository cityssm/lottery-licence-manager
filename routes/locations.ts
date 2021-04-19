import { Router } from "express";

import * as permissionHandlers from "../handlers/permissions.js";

import { handler as handler_doGetLocations } from "../handlers/locations-post/doGetLocations.js";
import { handler as handler_doGetInactive } from "../handlers/locations-post/doGetInactive.js";
import { handler as handler_doMerge } from "../handlers/locations-post/doMerge.js";

import { handler as handler_doCreate } from "../handlers/locations-post/doCreate.js";
import { handler as handler_doUpdate } from "../handlers/locations-post/doUpdate.js";
import { handler as handler_doDelete } from "../handlers/locations-post/doDelete.js";
import { handler as handler_doRestore } from "../handlers/locations-post/doRestore.js";

import { handler as handler_new } from "../handlers/locations-get/new.js";
import { handler as handler_view } from "../handlers/locations-get/view.js";
import { handler as handler_edit } from "../handlers/locations-get/edit.js";
import { handler as handler_cleanup } from "../handlers/locations-get/cleanup.js";


export const router = Router();


router.get("/", (_req, res) => {

  res.render("location-search", {
    headTitle: "Locations"
  });
});


router.post("/doGetLocations",
  handler_doGetLocations);


router.get("/cleanup",
  permissionHandlers.updateGetHandler,
  handler_cleanup);


router.post("/doGetInactive",
  handler_doGetInactive);


router.post("/doCreate",
  permissionHandlers.createPostHandler,
  handler_doCreate);


router.post("/doUpdate",
  permissionHandlers.createPostHandler,
  handler_doUpdate);


router.post("/doDelete",
  permissionHandlers.createPostHandler,
  handler_doDelete);


router.post("/doRestore",
  permissionHandlers.updatePostHandler,
  handler_doRestore);


router.post("/doMerge",
  permissionHandlers.adminPostHandler,
  handler_doMerge);


router.get("/new",
  permissionHandlers.createGetHandler,
  handler_new);


router.get("/:locationID",
  handler_view);


router.get("/:locationID/edit",
  permissionHandlers.createGetHandler,
  handler_edit);
