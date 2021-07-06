import sqlite from "better-sqlite3";
export declare const runSQL: (sql: string, parameters?: any[]) => sqlite.RunResult;
export declare const runSQL_hasChanges: (sql: string, parameters?: any[]) => boolean;
