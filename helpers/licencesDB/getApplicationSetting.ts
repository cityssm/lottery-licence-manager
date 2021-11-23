import sqlite from "better-sqlite3";
import { licencesDB as databasePath } from "../../data/databasePaths.js";


type ApplicationSettingKey = "licences.externalLicenceNumber.range.start" | "licences.externalLicenceNumber.range.end";


export const getApplicationSettingWithDB = (database: sqlite.Database, settingKey: ApplicationSettingKey): string => {

  const row = database.prepare("select settingValue" +
    " from ApplicationSettings" +
    " where settingKey = ?")
    .get(settingKey);

  if (row) {
    return row.settingValue || "";
  }

  return "";
};


export const getApplicationSetting = (settingKey: ApplicationSettingKey): string => {

  const database = sqlite(databasePath, {
    readonly: true
  });

  const settingValue = getApplicationSettingWithDB(database, settingKey);

  database.close();

  return settingValue;
};
