import sqlite from "better-sqlite3";
import { usersDB as databasePath } from "../../data/databasePaths.js";


export const updateUserProperty = (requestBody: {
  userName: string;
  propertyName: "isAdmin" | "canUpdate" | "canCreate";
  propertyValue: string;
}): boolean => {

  const database = sqlite(databasePath);

  const info = requestBody.propertyValue === "" ?
    database.prepare("delete from UserProperties" +
      " where userName = ?" +
      " and propertyName = ?")
      .run(
        requestBody.userName,
        requestBody.propertyName
      )
    : database.prepare("replace into UserProperties" +
      " (userName, propertyName, propertyValue)" +
      " values (?, ?, ?)")
      .run(
        requestBody.userName,
        requestBody.propertyName,
        requestBody.propertyValue
      );

  database.close();

  return info.changes > 0;
};
