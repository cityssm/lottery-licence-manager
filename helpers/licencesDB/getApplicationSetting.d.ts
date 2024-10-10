import sqlite from 'better-sqlite3';
type ApplicationSettingKey = 'licences.externalLicenceNumber.range.start' | 'licences.externalLicenceNumber.range.end';
export declare function getApplicationSettingWithDB(database: sqlite.Database, settingKey: ApplicationSettingKey): string;
export default function getApplicationSetting(settingKey: ApplicationSettingKey): string;
export {};
