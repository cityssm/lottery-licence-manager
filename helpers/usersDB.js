/* global require, module */


const configFns = require("./configFns");


const sqlite = require("better-sqlite3");
const dbPath = "data/users.db";

const bcrypt = require("bcrypt");


let usersDB = {

  getUser: function(userName, passwordPlain) {
    "use strict";

    const db = sqlite(dbPath);

    // Check if an active user exists

    const row = db.prepare("select userName, tempPassword, passwordHash" +
        " from Users" +
        " where isActive = 1" +
        " and userName = ?")
      .get(userName);

    if (!row) {
      db.close();
      return null;
    }

    // Check if the password matches

    userName = row.userName;

    let passwordIsValid = false;

    if (row.tempPassword && row.tempPassword !== "" && row.tempPassword === passwordPlain) {

      passwordIsValid = true;

      const hash = bcrypt.hashSync(passwordPlain, 10);

      db.prepare("update Users" +
          " set tempPassword = null," +
          " passwordHash = ?" +
          " where userName = ?")
        .run(hash, userName);


    } else if (row.passwordHash && row.passwordHash !== "" && bcrypt.compareSync(passwordPlain, row.passwordHash)) {
      passwordIsValid = true;
    }

    if (!passwordIsValid) {
      db.close();
      return null;
    }

    // Get user properties

    let userProperties = configFns.getProperty("user.defaultProperties");

    const userPropertyRows = db.prepare("select propertyName, propertyValue" +
      " from UserProperties" +
      " where userName = ?")
      .all(userName);

    for (let userPropertyIndex = 0; userPropertyIndex < userPropertyRows.length; userPropertyIndex += 1) {
      userProperties[userPropertyRows[userPropertyIndex].propertyName] = userPropertyRows[userPropertyIndex].propertyValue;
    }

    db.close();

    return {
      userName: userName,
      userProperties: userProperties
    };
  }
};



module.exports = usersDB;
