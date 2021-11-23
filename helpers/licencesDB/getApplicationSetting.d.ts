import sqlite from "better-sqlite3";
declare type ApplicationSettingKey = "licences.externalLicenceNumber.range.start" | "licences.externalLicenceNumber.range.end";
export declare const getApplicationSettingWithDB: (database: sqlite.Database, settingKey: ApplicationSettingKey) => string;
export declare const getApplicationSetting: (settingKey: ApplicationSettingKey) => string;
export {};
