/* global require, module */


const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");


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

    const usersDB = require("better-sqlite3")("data/users.db");

    let userName = req.body.userName;
    const passwordPlain = req.body.password;

    let doLogin = false;

    const row = usersDB.prepare("select UserName, TempPassword, PasswordHash from Users where IsActive = 1 and UserName = ?").get(userName);

    if (row) {

      userName = row.UserName;

      if (row.TempPassword && row.TempPassword !== "") {

        if (row.TempPassword === passwordPlain) {

          doLogin = true;

          const hash = bcrypt.hashSync(passwordPlain, 10);

          usersDB.prepare("update Users" +
              " set TempPassword = null," +
              " PasswordHash = ?" +
              " where UserName = ?")
            .run(hash, userName);
        }

      } else if (row.PasswordHash && row.PasswordHash !== "") {
        doLogin = bcrypt.compareSync(passwordPlain, row.PasswordHash);
      }

    }

    if (doLogin) {

      const userPropertyRows = usersDB.prepare("select PropertyName, PropertyValue from UserProperties where UserName = ?").all(userName);

      let userProperties = {};

      for (let userPropertyIndex = 0; userPropertyIndex < userPropertyRows.length; userPropertyIndex += 1) {
        userProperties[userPropertyRows[userPropertyIndex].PropertyName] = userPropertyRows[userPropertyIndex].PropertyValue;
      }

      req.session.user = {
        userName: userName,
        userProperties: userProperties
      };

      res.redirect("/dashboard");

    } else {
      res.render("login", {
        userName: userName,
        message: "Login Failed"
      });
    }



  });


module.exports = router;
