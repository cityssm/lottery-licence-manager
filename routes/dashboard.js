/* global require, module */

const express = require("express");
const router = express.Router();

const configFns = require("../helpers/configFns");


router.get("/", function(req, res) {
  "use strict";

  res.render("dashboard", {
    headTitle: "Dashboard"
  });
});


router.post("/doChangePassword", function(req, res) {
  "use strict";

  const userName = req.session.user.userName;
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;

  const usersDB = require("../helpers/usersDB");

  const result = usersDB.tryResetPassword(userName, oldPassword, newPassword);

  res.json(result);
});


router.get("/doGetDefaultConfigProperties", function(req, res) {
  "use strict";

  res.json({
    city: configFns.getProperty("defaults.city"),
    province: configFns.getProperty("defaults.province"),
    externalReceiptNumber_fieldLabel: configFns.getProperty("licences.externalReceiptNumber.fieldLabel")
  });
});


module.exports = router;
