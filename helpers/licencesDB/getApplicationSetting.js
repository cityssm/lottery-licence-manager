"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApplicationSetting = exports.getApplicationSettingWithDB = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
exports.getApplicationSettingWithDB = (db, settingKey) => {
    const row = db.prepare("select settingValue" +
        " from ApplicationSettings" +
        " where settingKey = ?")
        .get(settingKey);
    if (row) {
        return row.settingValue || "";
    }
    return "";
};
exports.getApplicationSetting = (settingKey) => {
    const db = sqlite(databasePaths_1.licencesDB, {
        readonly: true
    });
    const settingValue = exports.getApplicationSettingWithDB(db, settingKey);
    db.close();
    return settingValue;
};
