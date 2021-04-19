import sqlite from "better-sqlite3";
import { licencesDB as dbPath } from "../../data/databasePaths.js";
export const createOrganization = (reqBody, reqSession) => {
    const db = sqlite(dbPath);
    const nowMillis = Date.now();
    const info = db.prepare("insert into Organizations (" +
        "organizationName, organizationAddress1, organizationAddress2," +
        " organizationCity, organizationProvince, organizationPostalCode," +
        " organizationNote," +
        " recordCreate_userName, recordCreate_timeMillis," +
        " recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(reqBody.organizationName, reqBody.organizationAddress1, reqBody.organizationAddress2, reqBody.organizationCity, reqBody.organizationProvince, reqBody.organizationPostalCode, "", reqSession.user.userName, nowMillis, reqSession.user.userName, nowMillis);
    db.close();
    return Number(info.lastInsertRowid);
};
