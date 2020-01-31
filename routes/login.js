"use strict";
const express = require("express");
const router = express.Router();
const configFns_1 = require("../helpers/configFns");
const usersDB_1 = require("../helpers/usersDB");
router.route("/")
    .get(function (req, res) {
    const sessionCookieName = configFns_1.configFns.getProperty("session.cookieName");
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
    const userObj = usersDB_1.usersDB.getUser(userName, passwordPlain);
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
