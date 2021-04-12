import * as sqlite from "better-sqlite3";
export declare const runSQL: (sql: string, params?: any[]) => sqlite.RunResult;
export declare const runSQL_hasChanges: (sql: string, params?: any[]) => boolean;
