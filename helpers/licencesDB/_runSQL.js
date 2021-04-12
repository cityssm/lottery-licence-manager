"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSQL_hasChanges = exports.runSQL = void 0;
const _runSQLByName_1 = require("../_runSQLByName");
const debug_1 = require("debug");
const debugSQL = debug_1.debug("lottery-licence-manager:licencesDB:runSQL");
const runSQL = (sql, params = []) => {
    let db;
    try {
        return _runSQLByName_1.runSQLByName("licencesDB", sql, params);
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
exports.runSQL = runSQL;
const runSQL_hasChanges = (sql, params = []) => {
    const result = exports.runSQL(sql, params);
    if (result) {
        return result.changes > 0;
    }
    return false;
};
exports.runSQL_hasChanges = runSQL_hasChanges;
