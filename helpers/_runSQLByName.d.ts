import sqlite from "better-sqlite3";
export declare const runSQLWithDB: (database: sqlite.Database, sql: string, parameters?: any[]) => sqlite.RunResult;
export declare const runSQLByName: (databaseName: "licencesDB" | "usersDB", sql: string, parameters?: any[]) => sqlite.RunResult;
