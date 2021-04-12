"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeletedOrganizations = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const getDeletedOrganizations = () => {
    const db = sqlite(databasePaths_1.licencesDB, {
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
exports.getDeletedOrganizations = getDeletedOrganizations;
