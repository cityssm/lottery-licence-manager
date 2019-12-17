/* global require, module */


const express = require("express");
const router = express.Router();

const configFns = require("../helpers/configFns");


router.route("/")
  .get(function(req, res) {
    "use strict";

    const sessionCookieName = configFns.getProperty("session.cookieName");

    if (req.session.user && req.cookies[sessionCookieName]) {

      if (req.query.redirect && req.query.redirect !== "") {
        res.redirect(req.query.redirect);
      } else {

        res.redirect("/dashboard");
      }
    } else {
      res.render("login", {
        userName: "",
        message: "",
        redirect: req.query.redirect
      });
    }
  })
  .post(function(req, res) {
    "use strict";

    let userName = req.body.userName;
    const passwordPlain = req.body.password;

    const usersDB = require("../helpers/usersDB");
    const userObj = usersDB.getUser(userName, passwordPlain);

    if (userObj) {
      req.session.user = userObj;

      if (req.body.redirect && req.body.redirect !== "") {
        res.redirect(req.body.redirect);
      } else {
        res.redirect("/dashboard");
      }

    } else {
      res.render("login", {
        userName: userName,
        message: "Login Failed"
      });
    }
  });


module.exports = router;
