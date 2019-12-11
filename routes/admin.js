/* global require, module */

const express = require("express");
const router = express.Router();


const licencesDB = require("../helpers/licencesDB");
const usersDB = require("../helpers/usersDB");


// Application Settings


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
    res.json({
      success: false,
      message: "Not Allowed"
    });
    return;
  }

  const settingKey = req.body.settingKey;
  const settingValue = req.body.settingValue;

  const changeCount = licencesDB.updateApplicationSetting(settingKey, settingValue, req.session);

  res.json({
    success: (changeCount === 1)
  });
});


// User Management


router.get("/userManagement", function(req, res) {
  "use strict";

  if (req.session.user.userProperties.isAdmin !== "true") {
    res.redirect("/dashboard/?error=accessDenied");
    return;
  }

  const users = usersDB.getAllUsers();

  res.render("admin-userManagement", {
    headTitle: "User Management",
    users: users
  });
});


router.post("/doUpdateUser", function(req, res) {
  "use strict";

  if (req.session.user.userProperties.isAdmin !== "true") {
    res.json({
      success: false,
      message: "Not Allowed"
    });
    return;
  }

  const changeCount = usersDB.updateUser(req.body);

  res.json({
    success: (changeCount === 1)
  });
});


router.post("/doResetPassword", function(req, res) {
  "use strict";

  if (req.session.user.userProperties.isAdmin !== "true") {
    res.json({
      success: false,
      message: "Not Allowed"
    });
    return;
  }

  const newPassword = usersDB.resetPassword(req.body.userName);

  res.json({
    success: true,
    newPassword: newPassword
  });
});



module.exports = router;
