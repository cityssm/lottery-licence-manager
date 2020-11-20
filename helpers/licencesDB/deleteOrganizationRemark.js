"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrganizationRemark = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
const deleteOrganizationRemark = (organizationID, remarkIndex, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB);
    const nowMillis = Date.now();
    const info = db.prepare("update OrganizationRemarks" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where organizationID = ?" +
        " and remarkIndex = ?" +
        " and recordDelete_timeMillis is null")
        .run(reqSession.user.userName, nowMillis, organizationID, remarkIndex);
    db.close();
    return info.changes > 0;
};
exports.deleteOrganizationRemark = deleteOrganizationRemark;
