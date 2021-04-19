import sqlite from "better-sqlite3";
import { licencesDB as dbPath } from "../../data/databasePaths.js";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
export const getDeletedOrganizations = () => {
    const db = sqlite(dbPath, {
        readonly: true
    });
    const organizations = db.prepare("select organizationID, organizationName," +
        " recordDelete_timeMillis, recordDelete_userName" +
        " from Organizations" +
        " where recordDelete_timeMillis is not null" +
        " order by organizationName, recordDelete_timeMillis desc")
        .all();
    db.close();
    for (const organization of organizations) {
        organization.recordDelete_dateString = dateTimeFns.dateToString(new Date(organization.recordDelete_timeMillis));
    }
    return organizations;
};
