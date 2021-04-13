"use strict";
const express_1 = require("express");
const permissionHandlers = require("../handlers/permissions");
const doGetLocations_1 = require("../handlers/locations-post/doGetLocations");
const doGetInactive_1 = require("../handlers/locations-post/doGetInactive");
const doMerge_1 = require("../handlers/locations-post/doMerge");
const doCreate_1 = require("../handlers/locations-post/doCreate");
const doUpdate_1 = require("../handlers/locations-post/doUpdate");
const doDelete_1 = require("../handlers/locations-post/doDelete");
const doRestore_1 = require("../handlers/locations-post/doRestore");
const new_1 = require("../handlers/locations-get/new");
const view_1 = require("../handlers/locations-get/view");
const edit_1 = require("../handlers/locations-get/edit");
const cleanup_1 = require("../handlers/locations-get/cleanup");
const router = express_1.Router();
router.get("/", (_req, res) => {
    res.render("location-search", {
        headTitle: "Locations"
    });
});
router.post("/doGetLocations", doGetLocations_1.handler);
router.get("/cleanup", permissionHandlers.updateGetHandler, cleanup_1.handler);
router.post("/doGetInactive", doGetInactive_1.handler);
router.post("/doCreate", permissionHandlers.createPostHandler, doCreate_1.handler);
router.post("/doUpdate", permissionHandlers.createPostHandler, doUpdate_1.handler);
router.post("/doDelete", permissionHandlers.createPostHandler, doDelete_1.handler);
router.post("/doRestore", permissionHandlers.updatePostHandler, doRestore_1.handler);
router.post("/doMerge", permissionHandlers.adminPostHandler, doMerge_1.handler);
router.get("/new", permissionHandlers.createGetHandler, new_1.handler);
router.get("/:locationID", view_1.handler);
router.get("/:locationID/edit", permissionHandlers.createGetHandler, edit_1.handler);
module.exports = router;
