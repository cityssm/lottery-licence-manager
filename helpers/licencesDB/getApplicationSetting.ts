import sqlite from "better-sqlite3";
import { licencesDB as dbPath } from "../../data/databasePaths.js";


export const getApplicationSettingWithDB = (db: sqlite.Database, settingKey: string): string => {

  const row = db.prepare("select settingValue" +
    " from ApplicationSettings" +
    " where settingKey = ?")
    .get(settingKey);

  if (row) {
    return row.settingValue || "";
  }

  return "";
};


export const getApplicationSetting = (settingKey: string) => {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const settingValue = getApplicationSettingWithDB(db, settingKey);

  db.close();

  return settingValue;
};
