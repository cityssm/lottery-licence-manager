"use strict";
const express_1 = require("express");
const configFns = require("../helpers/configFns");
const mdFile_1 = require("../handlers/docs-get/mdFile");
const router = express_1.Router();
const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");
router.all("/", (_req, res) => {
    res.redirect(urlPrefix + "/docs/readme.md");
});
router.all("/:mdFileName", mdFile_1.handler);
module.exports = router;
