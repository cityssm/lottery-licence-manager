/* global require, module */

const express = require("express");
const router = express.Router();


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


module.exports = router;
