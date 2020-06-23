import { Router } from "express";
const router = Router();

import * as licencesDB from "../helpers/licencesDB";
import * as usersDB from "../helpers/usersDB";


// Application Settings

router.get("/applicationSettings", (req, res) => {

  if (!req.session.user.userProperties.isAdmin) {

    res.redirect("/dashboard/?error=accessDenied");
    return;

  }

  const applicationSettings = licencesDB.getApplicationSettings();

  res.render("admin-applicationSettings", {
    headTitle: "Application Settings",
    applicationSettings: applicationSettings
  });

});


router.post("/doSaveApplicationSetting", (req, res) => {

  if (!req.session.user.userProperties.isAdmin) {

    res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
      });

    return;

  }

  const settingKey = req.body.settingKey;
  const settingValue = req.body.settingValue;

  const success = licencesDB.updateApplicationSetting(settingKey, settingValue, req.session);

  res.json({
    success: success
  });

});


// User Management


router.get("/userManagement", (req, res) => {

  if (!req.session.user.userProperties.isAdmin) {

    res.redirect("/dashboard/?error=accessDenied");
    return;

  }

  const users = usersDB.getAllUsers();

  res.render("admin-userManagement", {
    headTitle: "User Management",
    users: users
  });

});


router.post("/doCreateUser", (req, res) => {

  if (!req.session.user.userProperties.isAdmin) {

    res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
      });

    return;

  }

  const newPassword = usersDB.createUser(req.body);

  if (!newPassword) {

    res.json({
      success: false,
      message: "New Account Not Created"
    });

  } else {

    res.json({
      success: true,
      newPassword: newPassword
    });

  }

});


router.post("/doUpdateUser", (req, res) => {

  if (!req.session.user.userProperties.isAdmin) {

    res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
      });

    return;

  }

  const changeCount = usersDB.updateUser(req.body);

  res.json({
    success: (changeCount === 1)
  });

});


router.post("/doUpdateUserProperty", (req, res) => {

  if (!req.session.user.userProperties.isAdmin) {

    res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
      });

    return;

  }

  const changeCount = usersDB.updateUserProperty(req.body);

  res.json({
    success: (changeCount === 1)
  });

});


router.post("/doResetPassword", (req, res) => {

  if (!req.session.user.userProperties.isAdmin) {

    res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
      });

    return;

  }

  const newPassword = usersDB.generateNewPassword(req.body.userName);

  res.json({
    success: true,
    newPassword: newPassword
  });

});


router.post("/doGetUserProperties", (req, res) => {

  if (!req.session.user.userProperties.isAdmin) {

    res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
      });
    return;

  }

  const userProperties = usersDB.getUserProperties(req.body.userName);

  res.json(userProperties);

});


router.post("/doDeleteUser", (req, res) => {

  if (!req.session.user.userProperties.isAdmin) {

    res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
      });
    return;

  }

  const userNameToDelete = req.body.userName;

  if (userNameToDelete === req.session.user.userName) {

    // You can't delete yourself!

    res
      .status(403)
      .json({
        success: false,
        message: "Forbidden"
      });
    return;

  }

  const success = usersDB.inactivateUser(userNameToDelete);

  res.json({
    success: success
  });

});


export = router;
