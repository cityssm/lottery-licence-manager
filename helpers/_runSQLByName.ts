import sqlite from "better-sqlite3";

import { licencesDB, usersDB } from "../data/databasePaths.js";

import debug from "debug";
const debugSQL = debug("lottery-licence-manager:runSQLWithDB");


export const runSQLWithDB = (database: sqlite.Database, sql: string, parameters: any[] = []): sqlite.RunResult => {

  try {
    return database.prepare(sql).run(parameters);
  } catch (error) {
    debugSQL(error);
  }
};


export const runSQLByName = (databaseName: "licencesDB" | "usersDB", sql: string, parameters: any[] = []): sqlite.RunResult => {

  let database: sqlite.Database;

  try {
    database = sqlite(databaseName === "licencesDB" ? licencesDB : usersDB);
    return runSQLWithDB(database, sql, parameters);
  } catch (error) {
    debugSQL(error);
  } finally {
    try {
      database.close();
    } catch {
      // ignore
    }
  }
};
