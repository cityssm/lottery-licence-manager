import sqlite from "better-sqlite3";
import { licencesDB as databasePath } from "../../data/databasePaths.js";
export const getApplicationSettingWithDB = (database, settingKey) => {
    const row = database.prepare("select settingValue" +
        " from ApplicationSettings" +
        " where settingKey = ?")
        .get(settingKey);
    if (row) {
        return row.settingValue || "";
    }
    return "";
};
export const getApplicationSetting = (settingKey) => {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const settingValue = getApplicationSettingWithDB(database, settingKey);
    database.close();
    return settingValue;
};
