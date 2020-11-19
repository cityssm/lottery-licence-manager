"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrganizationBankRecord = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
exports.deleteOrganizationBankRecord = (organizationID, recordIndex, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB);
    const nowMillis = Date.now();
    const info = db.prepare("update OrganizationBankRecords" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where organizationID = ?" +
        " and recordIndex = ?" +
        " and recordDelete_timeMillis is null")
        .run(reqSession.user.userName, nowMillis, organizationID, recordIndex);
    db.close();
    return info.changes > 0;
};
