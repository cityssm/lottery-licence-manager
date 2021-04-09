"use strict";
const express_1 = require("express");
const reportName_1 = require("../handlers/reports-get/reportName");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const router = express_1.Router();
router.get("/", (_req, res) => {
    const rightNow = new Date();
    res.render("report-search", {
        headTitle: "Reports",
        todayDateString: dateTimeFns.dateToString(rightNow)
    });
});
router.all("/:reportName", reportName_1.handler);
module.exports = router;
