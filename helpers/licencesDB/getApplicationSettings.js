"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApplicationSettings = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
exports.getApplicationSettings = () => {
    const db = sqlite(databasePaths_1.licencesDB, {
        readonly: true
    });
    const rows = db.prepare("select * from ApplicationSettings order by orderNumber, settingKey").all();
    db.close();
    return rows;
};
