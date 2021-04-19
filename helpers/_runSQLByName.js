import sqlite from "better-sqlite3";
import { licencesDB, usersDB } from "../data/databasePaths.js";
import debug from "debug";
const debugSQL = debug("lottery-licence-manager:runSQLWithDB");
export const runSQLWithDB = (db, sql, params = []) => {
    try {
        return db.prepare(sql).run(params);
    }
    catch (e) {
        debugSQL(e);
    }
};
export const runSQLByName = (dbName, sql, params = []) => {
    let db;
    try {
        db = sqlite(dbName === "licencesDB" ? licencesDB : usersDB);
        return runSQLWithDB(db, sql, params);
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
