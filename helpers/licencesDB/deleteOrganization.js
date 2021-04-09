"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrganization = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
const deleteOrganization = (organizationID, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB);
    const nowMillis = Date.now();
    const info = db.prepare("update Organizations" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where organizationID = ?" +
        " and recordDelete_timeMillis is null")
        .run(reqSession.user.userName, nowMillis, organizationID);
    db.close();
    return info.changes > 0;
};
exports.deleteOrganization = deleteOrganization;
