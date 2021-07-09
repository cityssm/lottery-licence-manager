import sqlite from "better-sqlite3";
export declare const runSQLWithDB: (database: sqlite.Database, sql: string, parameters?: unknown[]) => sqlite.RunResult;
export declare const runSQLByName: (databaseName: "licencesDB" | "usersDB", sql: string, parameters?: unknown[]) => sqlite.RunResult;
