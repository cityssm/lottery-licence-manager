"use strict";

import express = require("express");
const router = express.Router();

import * as configFns from "../helpers/configFns";

import * as usersDB from "../helpers/usersDB";


router.get("/", function(_req, res) {

  res.render("dashboard", {
    headTitle: "Dashboard"
  });

});


router.post("/doChangePassword", function(req, res) {

  const userName = req.session.user.userName;
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;

  const result = usersDB.tryResetPassword(userName, oldPassword, newPassword);

  res.json(result);

});


router.all("/doGetDefaultConfigProperties", function(_req, res) {

  res.json({
    city: configFns.getProperty("defaults.city"),
    province: configFns.getProperty("defaults.province"),
    externalLicenceNumber_fieldLabel: configFns.getProperty("licences.externalLicenceNumber.fieldLabel"),
    externalReceiptNumber_fieldLabel: configFns.getProperty("licences.externalReceiptNumber.fieldLabel")
  });

});


export = router;