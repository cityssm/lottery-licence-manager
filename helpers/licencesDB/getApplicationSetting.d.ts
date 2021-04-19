import sqlite from "better-sqlite3";
export declare const getApplicationSettingWithDB: (db: sqlite.Database, settingKey: string) => string;
export declare const getApplicationSetting: (settingKey: string) => string;
