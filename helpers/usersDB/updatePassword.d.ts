import sqlite from "better-sqlite3";
export declare const updatePasswordWithDB: (db: sqlite.Database, userName: string, passwordPlain: string) => Promise<void>;
export declare const updatePassword: (userName: string, passwordPlain: string) => Promise<void>;
