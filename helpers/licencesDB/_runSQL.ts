/* eslint-disable unicorn/filename-case */

import sqlite from "better-sqlite3";

import { runSQLByName } from "../_runSQLByName.js";

import debug from "debug";
const debugSQL = debug("lottery-licence-manager:licencesDB:runSQL");


export const runSQL = (sql: string, parameters = []): sqlite.RunResult => {

  let database: sqlite.Database;

  try {
    return runSQLByName("licencesDB", sql, parameters);
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


export const runSQL_hasChanges = (sql: string, parameters = []): boolean => {

  const result = runSQL(sql, parameters);

  if (result) {
    return result.changes > 0;
  }

  return false;
};
