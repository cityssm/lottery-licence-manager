import * as sqlite from "better-sqlite3";

import { runSQLByName } from "../_runSQLByName";

import { debug } from "debug";
const debugSQL = debug("lottery-licence-manager:licencesDB:runSQL");


export const runSQL = (sql: string, params: any[] = []): sqlite.RunResult => {

  let db: sqlite.Database;

  try {
    return runSQLByName("licencesDB", sql, params);
  } catch (e) {
    debugSQL(e);
  } finally {
    try {
      db.close();
    } catch (_e) { }
  }
};


export const runSQL_hasChanges = (sql: string, params: any[] = []): boolean => {

  const result = runSQL(sql, params);

  if (result) {
    return result.changes > 0;
  }

  return false;
};
