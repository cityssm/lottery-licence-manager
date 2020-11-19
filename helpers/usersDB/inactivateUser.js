"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inactivateUser = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_2 = require("../../data/databasePaths");
exports.inactivateUser = (userName) => {
    const db = sqlite(databasePaths_2.usersDB);
    const info = db.prepare("update Users" +
        " set isActive = 0" +
        " where userName = ?" +
        " and isActive = 1")
        .run(userName);
    db.close();
    return info.changes;
};
