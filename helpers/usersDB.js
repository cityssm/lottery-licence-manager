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

      const hash = bcrypt.hashSync(userName + "::" + passwordPlain, 10);

      db.prepare("update Users" +
          " set tempPassword = null," +
          " passwordHash = ?" +
          " where userName = ?")
        .run(hash, userName);


    } else if (row.passwordHash && row.passwordHash !== "" && bcrypt.compareSync(userName + "::" + passwordPlain, row.passwordHash)) {
      passwordIsValid = true;
    }

    if (!passwordIsValid) {
      db.close();
      return null;
    }

    // Get user properties

    let userProperties = Object.assign({}, configFns.getProperty("user.defaultProperties"));

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
  },

  tryResetPassword: function(userName, oldPasswordPlain, newPasswordPlain) {
    "use strict";

    const db = sqlite(dbPath);

    const row = db.prepare("select passwordHash from Users" +
        " where userName = ?" +
        " and isActive = 1")
      .get(userName);

    if (!row) {
      db.close();
      return {
        success: false,
        message: "User record not found."
      };
    }

    const oldPasswordMatches = bcrypt.compareSync(userName + "::" + oldPasswordPlain, row.passwordHash);

    if (!oldPasswordMatches) {
      db.close();
      return {
        success: false,
        message: "Old password does not match."
      };
    }

    const newPasswordHash = bcrypt.hashSync(userName + "::" + newPasswordPlain, 10);

    db.prepare("update Users" +
        " set passwordHash = ?" +
        " where userName = ?")
      .run(newPasswordHash, userName);

    db.close();

    return {
      success: true,
      message: "Password updated successfully."
    };
  },

  getAllUsers: function() {
    "use strict";

    const db = sqlite(dbPath, {
      readonly: true
    });

    const rows = db.prepare("select userName, firstName, lastName" +
        " from Users" +
        " where isActive = 1" +
        " order by userName")
      .all();

    db.close();

    return rows;
  },

  getUserProperties: function(userName) {
    "use strict";

    const db = sqlite(dbPath, {
      readonly: true
    });

    let userProperties = Object.assign({}, configFns.getProperty("user.defaultProperties"));

    const userPropertyRows = db.prepare("select propertyName, propertyValue" +
        " from UserProperties" +
        " where userName = ?")
      .all(userName);

    for (let userPropertyIndex = 0; userPropertyIndex < userPropertyRows.length; userPropertyIndex += 1) {
      userProperties[userPropertyRows[userPropertyIndex].propertyName] = userPropertyRows[userPropertyIndex].propertyValue;
    }

    db.close();

    return userProperties;
  },

  createUser: function(reqBody) {
    "use strict";

    const freshPassword = require("fresh-password");
    const newPasswordPlain = freshPassword.generate();
    const hash = bcrypt.hashSync(newPasswordPlain, 10);

    const db = sqlite(dbPath);

    const row = db.prepare("select isActive" +
        " from Users" +
        " where userName = ?")
      .get(reqBody.userName);

    if (row) {
      if (row.isActive) {
        db.close();
        return false;

      } else {
        db.prepare("update Users" +
            " set firstName = ?," +
            " lastName = ?," +
            " tempPassword = null," +
            " passwordHash = ?," +
            " isActive = 1" +
            " where userName = ?")
          .run();
      }

    } else {
      db.prepare("insert into Users" +
          " (userName, firstName, lastName, isActive, passwordHash)" +
          " values (?, ?, ?, 1, ?)")
        .run(reqBody.userName, reqBody.firstName, reqBody.lastName, hash);
    }

    return newPasswordPlain;
  },

  updateUser: function(reqBody) {
    "use strict";

    const db = sqlite(dbPath);

    const info = db.prepare("update Users" +
        " set firstName = ?," +
        " lastName = ?" +
        " where userName = ?" +
        " and isActive = 1")
      .run(reqBody.firstName,
        reqBody.lastName,
        reqBody.userName);

    db.close();

    return info.changes;
  },

  updateUserProperty: function(reqBody) {
    "use strict";

    const db = sqlite(dbPath);

    let info;

    if (reqBody.propertyValue === "") {
      info = db.prepare("delete from UserProperties" +
          " where userName = ?" +
          " and propertyName = ?")
        .run(reqBody.userName,
          reqBody.propertyName);
    } else {

      info = db.prepare("replace into UserProperties" +
          " (userName, propertyName, propertyValue)" +
          " values (?, ?, ?)")
        .run(reqBody.userName,
          reqBody.propertyName,
          reqBody.propertyValue
        );
    }

    db.close();

    return info.changes;
  },

  generateNewPassword: function(userName) {
    "use strict";

    const freshPassword = require("fresh-password");
    const newPasswordPlain = freshPassword.generate();
    const hash = bcrypt.hashSync(userName + ":: " + newPasswordPlain, 10);

    const db = sqlite(dbPath);

    db.prepare("update Users" +
        " set tempPassword = null," +
        " passwordHash = ?" +
        " where userName = ?")
      .run(hash, userName);

    db.close();

    return newPasswordPlain;
  }
};



module.exports = usersDB;
