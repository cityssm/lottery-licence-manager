import sqlite from 'better-sqlite3';
export declare function runSQL(sql: string, parameters?: unknown[]): sqlite.RunResult | undefined;
export declare function runSQL_hasChanges(sql: string, parameters?: unknown[]): boolean;
