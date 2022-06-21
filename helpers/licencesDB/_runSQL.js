import sqlite from "better-sqlite3";
import { licencesDB as databasePath } from "../../data/databasePaths.js";
import debug from "debug";
const debugSQL = debug("lottery-licence-manager:licencesDB:runSQL");
export const runSQL = (sql, parameters = []) => {
    const database = sqlite(databasePath);
    try {
        return database.prepare(sql).run(...parameters);
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
export const runSQL_hasChanges = (sql, parameters = []) => {
    const result = runSQL(sql, parameters);
    if (result) {
        return result.changes > 0;
    }
    return false;
};
