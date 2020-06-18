"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
const express_1 = require("express");
const router = express_1.Router();
const licencesDB = __importStar(require("../helpers/licencesDB"));
const usersDB = __importStar(require("../helpers/usersDB"));
router.get("/applicationSettings", function (req, res) {
    if (!req.session.user.userProperties.isAdmin) {
        res.redirect("/dashboard/?error=accessDenied");
        return;
    }
    const applicationSettings = licencesDB.getApplicationSettings();
    res.render("admin-applicationSettings", {
        headTitle: "Application Settings",
        applicationSettings: applicationSettings
    });
});
router.post("/doSaveApplicationSetting", function (req, res) {
    if (!req.session.user.userProperties.isAdmin) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    const settingKey = req.body.settingKey;
    const settingValue = req.body.settingValue;
    const success = licencesDB.updateApplicationSetting(settingKey, settingValue, req.session);
    res.json({
        success: success
    });
});
router.get("/userManagement", function (req, res) {
    if (!req.session.user.userProperties.isAdmin) {
        res.redirect("/dashboard/?error=accessDenied");
        return;
    }
    const users = usersDB.getAllUsers();
    res.render("admin-userManagement", {
        headTitle: "User Management",
        users: users
    });
});
router.post("/doCreateUser", function (req, res) {
    if (!req.session.user.userProperties.isAdmin) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
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
            newPassword: newPassword
        });
    }
});
router.post("/doUpdateUser", function (req, res) {
    if (!req.session.user.userProperties.isAdmin) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    const changeCount = usersDB.updateUser(req.body);
    res.json({
        success: (changeCount === 1)
    });
});
router.post("/doUpdateUserProperty", function (req, res) {
    if (!req.session.user.userProperties.isAdmin) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    const changeCount = usersDB.updateUserProperty(req.body);
    res.json({
        success: (changeCount === 1)
    });
});
router.post("/doResetPassword", function (req, res) {
    if (!req.session.user.userProperties.isAdmin) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    const newPassword = usersDB.generateNewPassword(req.body.userName);
    res.json({
        success: true,
        newPassword: newPassword
    });
});
router.post("/doGetUserProperties", function (req, res) {
    if (!req.session.user.userProperties.isAdmin) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    const userProperties = usersDB.getUserProperties(req.body.userName);
    res.json(userProperties);
});
router.post("/doDeleteUser", function (req, res) {
    if (!req.session.user.userProperties.isAdmin) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    const userNameToDelete = req.body.userName;
    if (userNameToDelete === req.session.user.userName) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    const success = usersDB.inactivateUser(userNameToDelete);
    res.json({
        success: success
    });
});
module.exports = router;
