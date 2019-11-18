/* global require, module */


const express = require("express");
const router = express.Router();




router.route("/")
  .get(function(req, res) {

    "use strict";

    if (req.session.user && req.cookies.user_sid) {
      res.redirect("/dashboard");
    } else {
      res.render("login", {
        userName: "",
        message: ""
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
      res.redirect("/dashboard");

    } else {
      res.render("login", {
        userName: userName,
        message: "Login Failed"
      });
    }
  });


module.exports = router;
