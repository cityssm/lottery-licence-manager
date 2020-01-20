/* global require, module */

"use strict";

const express = require("express");
const router = express.Router();

const configFns = require("../helpers/configFns");


router.get("/", function(req, res) {

  res.render("dashboard", {
    headTitle: "Dashboard"
  });

});


router.post("/doChangePassword", function(req, res) {

  const userName = req.session.user.userName;
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;

  const usersDB = require("../helpers/usersDB");

  const result = usersDB.tryResetPassword(userName, oldPassword, newPassword);

  res.json(result);

});


router.get("/doGetDefaultConfigProperties", function(req, res) {

  res.json({
    city: configFns.getProperty("defaults.city"),
    province: configFns.getProperty("defaults.province"),
    externalReceiptNumber_fieldLabel: configFns.getProperty("licences.externalReceiptNumber.fieldLabel")
  });

});


module.exports = router;
