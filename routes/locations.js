"use strict";
const express_1 = require("express");
const permissionHandlers = require("../handlers/permissions");
const handler_doGetLocations = require("../handlers/locations-post/doGetLocations");
const handler_doGetInactive = require("../handlers/locations-post/doGetInactive");
const handler_doMerge = require("../handlers/locations-post/doMerge");
const handler_doCreate = require("../handlers/locations-post/doCreate");
const handler_doUpdate = require("../handlers/locations-post/doUpdate");
const handler_doDelete = require("../handlers/locations-post/doDelete");
const handler_doRestore = require("../handlers/locations-post/doRestore");
const handler_new = require("../handlers/locations-get/new");
const handler_view = require("../handlers/locations-get/view");
const handler_edit = require("../handlers/locations-get/edit");
const handler_cleanup = require("../handlers/locations-get/cleanup");
const router = express_1.Router();
router.get("/", (_req, res) => {
    res.render("location-search", {
        headTitle: "Locations"
    });
});
router.post("/doGetLocations", handler_doGetLocations.handler);
router.get("/cleanup", permissionHandlers.updateGetHandler, handler_cleanup.handler);
router.post("/doGetInactive", handler_doGetInactive.handler);
router.post("/doCreate", permissionHandlers.createPostHandler, handler_doCreate.handler);
router.post("/doUpdate", permissionHandlers.createPostHandler, handler_doUpdate.handler);
router.post("/doDelete", permissionHandlers.createPostHandler, handler_doDelete.handler);
router.post("/doRestore", permissionHandlers.updatePostHandler, handler_doRestore.handler);
router.post("/doMerge", permissionHandlers.adminPostHandler, handler_doMerge.handler);
router.get("/new", permissionHandlers.createGetHandler, handler_new.handler);
router.get("/:locationID", handler_view.handler);
router.get("/:locationID/edit", permissionHandlers.createGetHandler, handler_edit.handler);
module.exports = router;
