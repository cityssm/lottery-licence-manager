import sqlite from "better-sqlite3";
import { usersDB as databasePath } from "../../data/databasePaths.js";

import * as userFunctions from "../../helpers/functions.user.js";

import * as bcrypt from "bcrypt";

import * as configFunctions from "../../helpers/functions.config.js";

import type { User, UserProperties } from "../../types/recordTypes";


export const getUser = async(userNameSubmitted: string, passwordPlain: string): Promise<User> => {

  const database = sqlite(databasePath);

  // Check if an active user exists

  const row = database.prepare("select userName, passwordHash, isActive" +
    " from Users" +
    " where userName = ?")
    .get(userNameSubmitted);

  if (!row) {

    database.close();

    if (userNameSubmitted === "admin") {

      const adminPasswordPlain = configFunctions.getProperty("admin.defaultPassword");

      if (adminPasswordPlain === "") {
        return undefined;
      }

      if (adminPasswordPlain === passwordPlain) {

        const userProperties: UserProperties = Object.assign({}, configFunctions.getProperty("user.defaultProperties"));
        userProperties.isAdmin = true;
        userProperties.isDefaultAdmin = true;

        return {
          userName: userNameSubmitted,
          userProperties
        };
      }
    }

    return undefined;

  } else if (row.isActive === 0) {

    database.close();

    return undefined;
  }

  // Check if the password matches

  const databaseUserName = row.userName as string;

  const passwordIsValid =
    await bcrypt.compare(userFunctions.getHashString(databaseUserName, passwordPlain), row.passwordHash);

  if (!passwordIsValid) {

    database.close();
    return undefined;
  }

  // Get user properties

  const userProperties: UserProperties =
    Object.assign({}, configFunctions.getProperty("user.defaultProperties"));

  userProperties.isDefaultAdmin = false;

  const userPropertyRows = database.prepare("select propertyName, propertyValue" +
    " from UserProperties" +
    " where userName = ?")
    .all(databaseUserName);

  for (const userProperty of userPropertyRows) {

    const propertyName: string = userProperty.propertyName;
    const propertyValue: string = userProperty.propertyValue;

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
