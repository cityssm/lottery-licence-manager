"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProperties = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
const configFns = require("../../helpers/configFns");
exports.getUserProperties = (userName) => {
    const db = sqlite(databasePaths_1.usersDB, {
        readonly: true
    });
    const userProperties = Object.assign({}, configFns.getProperty("user.defaultProperties"));
    const userPropertyRows = db.prepare("select propertyName, propertyValue" +
        " from UserProperties" +
        " where userName = ?")
        .all(userName);
    for (const userProperty of userPropertyRows) {
        userProperties[userProperty.propertyName] = userProperty.propertyValue;
    }
    db.close();
    return userProperties;
};