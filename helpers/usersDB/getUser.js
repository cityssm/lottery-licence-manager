import sqlite from "better-sqlite3";
import { usersDB as databasePath } from "../../data/databasePaths.js";
import * as userFns from "../../helpers/userFns.js";
import * as bcrypt from "bcrypt";
import * as configFns from "../../helpers/configFns.js";
export const getUser = async (userNameSubmitted, passwordPlain) => {
    const database = sqlite(databasePath);
    const row = database.prepare("select userName, passwordHash, isActive" +
        " from Users" +
        " where userName = ?")
        .get(userNameSubmitted);
    if (!row) {
        database.close();
        if (userNameSubmitted === "admin") {
            const adminPasswordPlain = configFns.getProperty("admin.defaultPassword");
            if (adminPasswordPlain === "") {
                return undefined;
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
        return undefined;
    }
    else if (row.isActive === 0) {
        database.close();
        return undefined;
    }
    const databaseUserName = row.userName;
    const passwordIsValid = await bcrypt.compare(userFns.getHashString(databaseUserName, passwordPlain), row.passwordHash);
    if (!passwordIsValid) {
        database.close();
        return undefined;
    }
    const userProperties = Object.assign({}, configFns.getProperty("user.defaultProperties"));
    userProperties.isDefaultAdmin = false;
    const userPropertyRows = database.prepare("select propertyName, propertyValue" +
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
    database.close();
    return {
        userName: databaseUserName,
        userProperties
    };
};
export default getUser;
