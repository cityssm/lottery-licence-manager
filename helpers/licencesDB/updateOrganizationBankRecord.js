"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrganizationBankRecord = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
exports.updateOrganizationBankRecord = (reqBody, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB);
    const nowMillis = Date.now();
    const info = db.prepare("update OrganizationBankRecords" +
        " set recordDate = ?," +
        " recordIsNA = ?," +
        " recordNote = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where organizationID = ?" +
        " and recordIndex = ?" +
        " and recordDelete_timeMillis is null")
        .run(dateTimeFns.dateStringToInteger(reqBody.recordDateString), reqBody.recordIsNA ? 1 : 0, reqBody.recordNote, reqSession.user.userName, nowMillis, reqBody.organizationID, reqBody.recordIndex);
    db.close();
    return info.changes > 0;
};
