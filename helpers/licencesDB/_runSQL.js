import sqlite from 'better-sqlite3';
import debug from 'debug';
import { licencesDB as databasePath } from '../../data/databasePaths.js';
const debugSQL = debug('lottery-licence-manager:licencesDB:runSQL');
export function runSQL(sql, parameters = []) {
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
        catch {
        }
    }
}
export function runSQL_hasChanges(sql, parameters = []) {
    const result = runSQL(sql, parameters);
    if (result !== undefined) {
        return result.changes > 0;
    }
    return false;
}
