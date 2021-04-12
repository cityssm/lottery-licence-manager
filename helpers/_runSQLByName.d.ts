import * as sqlite from "better-sqlite3";
export declare const runSQLWithDB: (db: sqlite.Database, sql: string, params?: any[]) => sqlite.RunResult;
export declare const runSQLByName: (dbName: "licencesDB" | "usersDB", sql: string, params?: any[]) => sqlite.RunResult;
