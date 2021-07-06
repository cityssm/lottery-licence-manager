import sqlite from "better-sqlite3";
import { licencesDB, usersDB } from "../data/databasePaths.js";
import debug from "debug";
const debugSQL = debug("lottery-licence-manager:runSQLWithDB");
export const runSQLWithDB = (database, sql, parameters = []) => {
    try {
        return database.prepare(sql).run(parameters);
    }
    catch (error) {
        debugSQL(error);
    }
};
export const runSQLByName = (databaseName, sql, parameters = []) => {
    let database;
    try {
        database = sqlite(databaseName === "licencesDB" ? licencesDB : usersDB);
        return runSQLWithDB(database, sql, parameters);
    }
    catch (error) {
        debugSQL(error);
    }
    finally {
        try {
            database.close();
        }
        catch (_a) {
        }
    }
};
