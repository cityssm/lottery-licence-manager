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
router.route("/")
    .get(function (req, res) {
    const sessionCookieName = configFns.getProperty("session.cookieName");
    if (req.session.user && req.cookies[sessionCookieName]) {
        if (req.query.redirect && req.query.redirect !== "") {
            res.redirect(req.query.redirect);
        }
        else {
            res.redirect("/dashboard");
        }
    }
    else {
        res.render("login", {
            userName: "",
            message: "",
            redirect: req.query.redirect
        });
    }
})
    .post(function (req, res) {
    const userName = req.body.userName;
    const passwordPlain = req.body.password;
    const redirectURL = req.body.redirect;
    const userObj = usersDB.getUser(userName, passwordPlain);
    if (userObj) {
        req.session.user = userObj;
        if (redirectURL && redirectURL !== "") {
            res.redirect(req.body.redirect);
        }
        else {
            res.redirect("/dashboard");
        }
    }
    else {
        res.render("login", {
            userName: userName,
            message: "Login Failed",
            redirect: redirectURL
        });
    }
});
module.exports = router;
