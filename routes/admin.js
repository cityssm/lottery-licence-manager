"use strict";
const express_1 = require("express");
const licencesDB = require("../helpers/licencesDB");
const usersDB = require("../helpers/usersDB");
const userFns_1 = require("../helpers/userFns");
const router = express_1.Router();
router.get("/applicationSettings", (req, res) => {
    if (!userFns_1.userIsAdmin(req)) {
        res.redirect("/dashboard/?error=accessDenied");
        return;
    }
    const applicationSettings = licencesDB.getApplicationSettings();
    res.render("admin-applicationSettings", {
        headTitle: "Application Settings",
        applicationSettings
    });
});
router.post("/doSaveApplicationSetting", (req, res) => {
    if (!userFns_1.userIsAdmin(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const settingKey = req.body.settingKey;
    const settingValue = req.body.settingValue;
    const success = licencesDB.updateApplicationSetting(settingKey, settingValue, req.session);
    res.json({
        success
    });
});
router.get("/userManagement", (req, res) => {
    if (!userFns_1.userIsAdmin(req)) {
        res.redirect("/dashboard/?error=accessDenied");
        return;
    }
    const users = usersDB.getAllUsers();
    res.render("admin-userManagement", {
        headTitle: "User Management",
        users
    });
});
router.post("/doCreateUser", (req, res) => {
    if (!userFns_1.userIsAdmin(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const newPassword = usersDB.createUser(req.body);
    if (!newPassword) {
        res.json({
            success: false,
            message: "New Account Not Created"
        });
    }
    else {
        res.json({
            success: true,
            newPassword
        });
    }
});
router.post("/doUpdateUser", (req, res) => {
    if (!userFns_1.userIsAdmin(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const changeCount = usersDB.updateUser(req.body);
    res.json({
        success: (changeCount === 1)
    });
});
router.post("/doUpdateUserProperty", (req, res) => {
    if (!userFns_1.userIsAdmin(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const changeCount = usersDB.updateUserProperty(req.body);
    res.json({
        success: (changeCount === 1)
    });
});
router.post("/doResetPassword", (req, res) => {
    if (!userFns_1.userIsAdmin(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const newPassword = usersDB.generateNewPassword(req.body.userName);
    res.json({
        success: true,
        newPassword
    });
});
router.post("/doGetUserProperties", (req, res) => {
    if (!userFns_1.userIsAdmin(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const userProperties = usersDB.getUserProperties(req.body.userName);
    res.json(userProperties);
});
router.post("/doDeleteUser", (req, res) => {
    if (!userFns_1.userIsAdmin(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const userNameToDelete = req.body.userName;
    if (userNameToDelete === req.session.user.userName) {
        return userFns_1.forbiddenJSON(res);
    }
    const success = usersDB.inactivateUser(userNameToDelete);
    res.json({
        success
    });
});
module.exports = router;
