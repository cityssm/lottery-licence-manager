import { Router } from "express";

import * as permissionHandlers from "../handlers/permissions";

import * as handler_doGetLocations from "../handlers/locations-post/doGetLocations";
import * as handler_doGetInactive from "../handlers/locations-post/doGetInactive";
import * as handler_doMerge from "../handlers/locations-post/doMerge";

import * as handler_doCreate from "../handlers/locations-post/doCreate";
import * as handler_doUpdate from "../handlers/locations-post/doUpdate";
import * as handler_doDelete from "../handlers/locations-post/doDelete";
import * as handler_doRestore from "../handlers/locations-post/doRestore";

import * as handler_new from "../handlers/locations-get/new";
import * as handler_view from "../handlers/locations-get/view";
import * as handler_edit from "../handlers/locations-get/edit";
import * as handler_cleanup from "../handlers/locations-get/cleanup";


const router = Router();


router.get("/", (_req, res) => {

  res.render("location-search", {
    headTitle: "Locations"
  });
});


router.post("/doGetLocations",
  handler_doGetLocations.handler);


router.get("/cleanup",
  permissionHandlers.updateGetHandler,
  handler_cleanup.handler);


router.post("/doGetInactive",
  handler_doGetInactive.handler);


router.post("/doCreate",
  permissionHandlers.createPostHandler,
  handler_doCreate.handler);


router.post("/doUpdate",
  permissionHandlers.createPostHandler,
  handler_doUpdate.handler);


router.post("/doDelete",
  permissionHandlers.createPostHandler,
  handler_doDelete.handler);


router.post("/doRestore",
  permissionHandlers.updatePostHandler,
  handler_doRestore.handler);


router.post("/doMerge",
  permissionHandlers.adminPostHandler,
  handler_doMerge.handler);


router.get("/new",
  permissionHandlers.createGetHandler,
  handler_new.handler);


router.get("/:locationID",
  handler_view.handler);


router.get("/:locationID/edit",
  permissionHandlers.createGetHandler,
  handler_edit.handler);


export = router;
