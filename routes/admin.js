/* global require, module */

const express = require("express");
const router = express.Router();


router.get("/applicationSettings", function(req, res) {
  "use strict";

  if (req.session.user.userProperties.isAdmin !== "true") {
    res.redirect("/dashboard/?error=accessDenied");
    return;
  }

  res.render("admin-applicationSettings", {
    headTitle: "Application Settings"
  });
});


module.exports = router;
