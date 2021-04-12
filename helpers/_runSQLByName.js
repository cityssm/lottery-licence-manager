"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSQLByName = exports.runSQLWithDB = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../data/databasePaths");
const debug_1 = require("debug");
const debugSQL = debug_1.debug("lottery-licence-manager:runSQLWithDB");
const runSQLWithDB = (db, sql, params = []) => {
    try {
        return db.prepare(sql).run(params);
    }
    catch (e) {
        debugSQL(e);
    }
};
exports.runSQLWithDB = runSQLWithDB;
const runSQLByName = (dbName, sql, params = []) => {
    let db;
    try {
        db = sqlite(dbName === "licencesDB" ? databasePaths_1.licencesDB : databasePaths_1.usersDB);
        return exports.runSQLWithDB(db, sql, params);
    }
    catch (e) {
        debugSQL(e);
    }
    finally {
        try {
            db.close();
        }
        catch (_e) { }
    }
};
exports.runSQLByName = runSQLByName;
