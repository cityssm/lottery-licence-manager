"use strict";
const express_1 = require("express");
const doChangePassword_1 = require("../handlers/dashboard-post/doChangePassword");
const doGetDefaultConfigProperties_1 = require("../handlers/dashboard-post/doGetDefaultConfigProperties");
const licencesDB_getDashboardStats = require("../helpers/licencesDB/getDashboardStats");
const router = express_1.Router();
router.get("/", (_req, res) => {
    const stats = licencesDB_getDashboardStats.getDashboardStats();
    res.render("dashboard", {
        headTitle: "Dashboard",
        stats
    });
});
router.post("/doChangePassword", doChangePassword_1.handler);
router.all("/doGetDefaultConfigProperties", doGetDefaultConfigProperties_1.handler);
module.exports = router;
