import sqlite from "better-sqlite3";
import { licencesDB as databasePath } from "../../data/databasePaths.js";


export const getApplicationSettingWithDB = (database: sqlite.Database, settingKey: string): string => {

  const row = database.prepare("select settingValue" +
    " from ApplicationSettings" +
    " where settingKey = ?")
    .get(settingKey);

  if (row) {
    return row.settingValue || "";
  }

  return "";
};


export const getApplicationSetting = (settingKey: string): string => {

  const database = sqlite(databasePath, {
    readonly: true
  });

  const settingValue = getApplicationSettingWithDB(database, settingKey);

  database.close();

  return settingValue;
};
