"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
const userFns = require("../../helpers/userFns");
const bcrypt = require("bcrypt");
const configFns = require("../../helpers/configFns");
const getUser = async (userNameSubmitted, passwordPlain) => {
    const db = sqlite(databasePaths_1.usersDB);
    const row = db.prepare("select userName, passwordHash, isActive" +
        " from Users" +
        " where userName = ?")
        .get(userNameSubmitted);
    if (!row) {
        db.close();
        if (userNameSubmitted === "admin") {
            const adminPasswordPlain = configFns.getProperty("admin.defaultPassword");
            if (adminPasswordPlain === "") {
                return null;
            }
            if (adminPasswordPlain === passwordPlain) {
                const userProperties = Object.assign({}, configFns.getProperty("user.defaultProperties"));
                userProperties.isAdmin = true;
                userProperties.isDefaultAdmin = true;
                return {
                    userName: userNameSubmitted,
                    userProperties
                };
            }
        }
        return null;
    }
    else if (row.isActive === 0) {
        db.close();
        return null;
    }
    const databaseUserName = row.userName;
    const passwordIsValid = await bcrypt.compare(userFns.getHashString(databaseUserName, passwordPlain), row.passwordHash);
    if (!passwordIsValid) {
        db.close();
        return null;
    }
    const userProperties = Object.assign({}, configFns.getProperty("user.defaultProperties"));
    userProperties.isDefaultAdmin = false;
    const userPropertyRows = db.prepare("select propertyName, propertyValue" +
        " from UserProperties" +
        " where userName = ?")
        .all(databaseUserName);
    for (const userProperty of userPropertyRows) {
        const propertyName = userProperty.propertyName;
        const propertyValue = userProperty.propertyValue;
        switch (propertyName) {
            case "canCreate":
            case "canUpdate":
            case "isAdmin":
                userProperties[propertyName] = (propertyValue === "true");
                break;
            default:
                userProperties[propertyName] = propertyValue;
                break;
        }
    }
    db.close();
    return {
        userName: databaseUserName,
        userProperties
    };
};
exports.getUser = getUser;
