/* global require, module */


const express = require("express");
const router = express.Router();

const usersDB = require("better-sqlite3")("data/users.db");

const bcrypt = require("bcrypt");


function initUsersDB() {
  "use strict";

  const row = usersDB.prepare("select name from sqlite_master where type = 'table' and name = 'Users'").get();

  if (!row) {

    usersDB.prepare("create table if not exists Users (" +
      "UserName varchar(30) primary key not null," +
      " FirstName varchar(50), LastName varchar(50)," +
      " IsActive boolean not null default 1," +
      " TempPassword varchar(50), PasswordHash char(60))").run();

    usersDB.prepare("create table if not exists UserProperties (" +
      "UserName varchar(30) not null," +
      " PropertyName varchar(100) not null," +
      " PropertyValue text," +
      " foreign key (UserName) references Users (UserName))").run();

    return true;
  }

  return false;
}


router.route("/")
  .get(function(req, res) {

    "use strict";

    if (req.session.user && req.cookies.user_sid) {
      res.redirect("/dashboard");
    }

    const wasDbInitialized = initUsersDB();

    res.render("login", {
      userName: "",
      message: (wasDbInitialized ? "The Users Database was just created.  Please create some user records before attempting to log in." : "")
    });
  })
  .post(function(req, res) {

    "use strict";

    let userName = req.body.userName;
    const passwordPlain = req.body.password;

    let doLogin = false;

    const row = usersDB.prepare("select UserName, TempPassword, PasswordHash from Users where UserName = ?").get(userName);

    if (row) {

      userName = row.UserName;

      if (row.TempPassword) {

        if (row.TempPassword === passwordPlain) {

          doLogin = true;

          const hash = bcrypt.hashSync(passwordPlain, 10);

          usersDB.prepare("update Users" +
              " set TempPassword = null," +
              " PasswordHash = ?" +
              " where UserName = ?")
            .run(hash, userName);
        }

      } else if (row.PasswordHash) {
        doLogin = bcrypt.compareSync(passwordPlain, row.PasswordHash);
      }

    }

    if (doLogin) {
      req.session.user = {
        userName: userName
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
