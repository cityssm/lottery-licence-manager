import sqlite from 'better-sqlite3';
export declare function runSQL(sql: string, parameters?: never[]): sqlite.RunResult | undefined;
export declare function runSQL_hasChanges(sql: string, parameters?: never[]): boolean;
