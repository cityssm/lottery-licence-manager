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
const configFns = __importStar(require("../helpers/configFns"));
const usersDB = __importStar(require("../helpers/usersDB"));
router.get("/", function (_req, res) {
    res.render("dashboard", {
        headTitle: "Dashboard"
    });
});
router.post("/doChangePassword", function (req, res) {
    const userName = req.session.user.userName;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    const result = usersDB.tryResetPassword(userName, oldPassword, newPassword);
    res.json(result);
});
router.all("/doGetDefaultConfigProperties", function (_req, res) {
    res.json({
        city: configFns.getProperty("defaults.city"),
        province: configFns.getProperty("defaults.province"),
        externalLicenceNumber_fieldLabel: configFns.getProperty("licences.externalLicenceNumber.fieldLabel"),
        externalReceiptNumber_fieldLabel: configFns.getProperty("licences.externalReceiptNumber.fieldLabel")
    });
});
module.exports = router;
