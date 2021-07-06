import { runSQLByName } from "../_runSQLByName.js";
import debug from "debug";
const debugSQL = debug("lottery-licence-manager:licencesDB:runSQL");
export const runSQL = (sql, parameters = []) => {
    let database;
    try {
        return runSQLByName("licencesDB", sql, parameters);
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
