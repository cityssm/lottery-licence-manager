"use strict";
const express_1 = require("express");
const configFns = require("../helpers/configFns");
const licencesDB_getDashboardStats = require("../helpers/licencesDB/getDashboardStats");
const usersDB = require("../helpers/usersDB");
const router = express_1.Router();
router.get("/", (_req, res) => {
    const stats = licencesDB_getDashboardStats.getDashboardStats();
    res.render("dashboard", {
        headTitle: "Dashboard",
        stats
    });
});
router.post("/doChangePassword", (req, res) => {
    const userName = req.session.user.userName;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    const result = usersDB.tryResetPassword(userName, oldPassword, newPassword);
    res.json(result);
});
router.all("/doGetDefaultConfigProperties", (_req, res) => {
    res.json({
        city: configFns.getProperty("defaults.city"),
        province: configFns.getProperty("defaults.province"),
        externalLicenceNumber_fieldLabel: configFns.getProperty("licences.externalLicenceNumber.fieldLabel"),
        externalReceiptNumber_fieldLabel: configFns.getProperty("licences.externalReceiptNumber.fieldLabel"),
        reminderCategories: configFns.getProperty("reminderCategories"),
        dismissingStatuses: configFns.getProperty("reminders.dismissingStatuses")
    });
});
module.exports = router;
