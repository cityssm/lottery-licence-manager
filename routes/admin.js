/* global require, module */

const express = require("express");
const router = express.Router();


const licencesDB = require("../helpers/licencesDB");


router.get("/applicationSettings", function(req, res) {
  "use strict";

  if (req.session.user.userProperties.isAdmin !== "true") {
    res.redirect("/dashboard/?error=accessDenied");
    return;
  }

  const applicationSettings = licencesDB.getApplicationSettings();

  res.render("admin-applicationSettings", {
    headTitle: "Application Settings",
    applicationSettings: applicationSettings
  });
});


router.post("/doSaveApplicationSetting", function(req, res) {
  "use strict";

  if (req.session.user.userProperties.isAdmin !== "true") {
    res.redirect("/dashboard/?error=accessDenied");
    return;
  }

  const settingKey = req.body.settingKey;
  const settingValue = req.body.settingValue;

  const changeCount = licencesDB.updateApplicationSetting(settingKey, settingValue, req.session);

  res.json({
    success: (changeCount === 1)
  });
});


module.exports = router;
