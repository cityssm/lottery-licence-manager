import sqlite from "better-sqlite3";
import { usersDB as databasePath } from "../../data/databasePaths.js";
import * as configFunctions from "../../helpers/functions.config.js";
export const getUserProperties = (userName) => {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const userProperties = Object.assign({}, configFunctions.getProperty("user.defaultProperties"));
    const userPropertyRows = database.prepare("select propertyName, propertyValue" +
        " from UserProperties" +
        " where userName = ?")
        .all(userName);
    for (const userProperty of userPropertyRows) {
        userProperties[userProperty.propertyName] = userProperty.propertyValue;
    }
    database.close();
    return userProperties;
};
