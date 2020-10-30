import * as sqlite from "better-sqlite3";
import { usersDB as dbPath } from "../../data/databasePaths";

import * as configFns from "../../helpers/configFns";

import type { UserProperties } from "../../types/recordTypes";


export const getUserProperties = (userName: string) => {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const userProperties: UserProperties =
    Object.assign({}, configFns.getProperty("user.defaultProperties"));

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
