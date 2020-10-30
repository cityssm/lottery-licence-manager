"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateApplicationSetting = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
exports.updateApplicationSetting = (settingKey, settingValue, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB);
    const nowMillis = Date.now();
    const info = db.prepare("update ApplicationSettings" +
        " set settingValue = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where settingKey = ?")
        .run(settingValue, reqSession.user.userName, nowMillis, settingKey);
    db.close();
    return info.changes > 0;
};
