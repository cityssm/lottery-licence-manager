"use strict";
const express = require("express");
const router = express.Router();
const licencesDB_1 = require("../helpers/licencesDB");
const usersDB_1 = require("../helpers/usersDB");
router.get("/applicationSettings", function (req, res) {
    if (req.session.user.userProperties.isAdmin !== "true") {
        res.redirect("/dashboard/?error=accessDenied");
        return;
    }
    const applicationSettings = licencesDB_1.licencesDB.getApplicationSettings();
    res.render("admin-applicationSettings", {
        headTitle: "Application Settings",
        applicationSettings: applicationSettings
    });
});
router.post("/doSaveApplicationSetting", function (req, res) {
    if (req.session.user.userProperties.isAdmin !== "true") {
        res.json({
            success: false,
            message: "Not Allowed"
        });
        return;
    }
    const settingKey = req.body.settingKey;
    const settingValue = req.body.settingValue;
    const changeCount = licencesDB_1.licencesDB.updateApplicationSetting(settingKey, settingValue, req.session);
    res.json({
        success: (changeCount === 1)
    });
});
router.get("/userManagement", function (req, res) {
    if (req.session.user.userProperties.isAdmin !== "true") {
        res.redirect("/dashboard/?error=accessDenied");
        return;
    }
    const users = usersDB_1.usersDB.getAllUsers();
    res.render("admin-userManagement", {
        headTitle: "User Management",
        users: users
    });
});
router.post("/doCreateUser", function (req, res) {
    if (req.session.user.userProperties.isAdmin !== "true") {
        res.json({
            success: false,
            message: "Not Allowed"
        });
        return;
    }
    const newPassword = usersDB_1.usersDB.createUser(req.body);
    if (!newPassword) {
        res.json({
            success: false,
            message: "New Account Not Created"
        });
    }
    else {
        res.json({
            success: true,
            newPassword: newPassword
        });
    }
});
router.post("/doUpdateUser", function (req, res) {
    if (req.session.user.userProperties.isAdmin !== "true") {
        res.json({
            success: false,
            message: "Not Allowed"
        });
        return;
    }
    const changeCount = usersDB_1.usersDB.updateUser(req.body);
    res.json({
        success: (changeCount === 1)
    });
});
router.post("/doUpdateUserProperty", function (req, res) {
    if (req.session.user.userProperties.isAdmin !== "true") {
        res.json({
            success: false,
            message: "Not Allowed"
        });
        return;
    }
    const changeCount = usersDB_1.usersDB.updateUserProperty(req.body);
    res.json({
        success: (changeCount === 1)
    });
});
router.post("/doResetPassword", function (req, res) {
    if (req.session.user.userProperties.isAdmin !== "true") {
        res.json({
            success: false,
            message: "Not Allowed"
        });
        return;
    }
    const newPassword = usersDB_1.usersDB.generateNewPassword(req.body.userName);
    res.json({
        success: true,
        newPassword: newPassword
    });
});
router.post("/doGetUserProperties", function (req, res) {
    if (req.session.user.userProperties.isAdmin !== "true") {
        res.json({
            success: false,
            message: "Not Allowed"
        });
        return;
    }
    const userProperties = usersDB_1.usersDB.getUserProperties(req.body.userName);
    res.json(userProperties);
});
module.exports = router;
