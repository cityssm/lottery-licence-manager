/* global require, module */


const sqlite = require("better-sqlite3");
const dbPath = "data/users.db";

const bcrypt = require("bcrypt");


let usersDB = {

  getUser: function(userName, passwordPlain) {
    "use strict";

    const db = sqlite(dbPath);

    // Check if an active user exists

    const row = db.prepare("select UserName, TempPassword, PasswordHash" +
        " from Users" +
        " where IsActive = 1" +
        " and UserName = ?")
      .get(userName);

    if (!row) {
      db.close();
      return null;
    }

    // Check if the password matches

    userName = row.UserName;

    let passwordIsValid = false;

    if (row.TempPassword && row.TempPassword !== "" && row.TempPassword === passwordPlain) {

      passwordIsValid = true;

      const hash = bcrypt.hashSync(passwordPlain, 10);

      db.prepare("update Users" +
          " set TempPassword = null," +
          " PasswordHash = ?" +
          " where UserName = ?")
        .run(hash, userName);


    } else if (row.PasswordHash && row.PasswordHash !== "" && bcrypt.compareSync(passwordPlain, row.PasswordHash)) {
      passwordIsValid = true;
    }

    if (!passwordIsValid) {
      db.close();
      return null;
    }

    // Get user paroperties

    let userProperties = {};

    const userPropertyRows = db.prepare("select PropertyName, PropertyValue" +
      " from UserProperties" +
      " where UserName = ?")
      .all(userName);

    for (let userPropertyIndex = 0; userPropertyIndex < userPropertyRows.length; userPropertyIndex += 1) {
      userProperties[userPropertyRows[userPropertyIndex].PropertyName] = userPropertyRows[userPropertyIndex].PropertyValue;
    }

    db.close();

    return {
      userName: userName,
      userProperties: userProperties
    };
  }
};



module.exports = usersDB;
