"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrganizationRemark = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const updateOrganizationRemark = (reqBody, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB);
    const nowMillis = Date.now();
    const info = db.prepare("update OrganizationRemarks" +
        " set remarkDate = ?," +
        " remarkTime = ?," +
        " remark = ?," +
        " isImportant = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where organizationID = ?" +
        " and remarkIndex = ?" +
        " and recordDelete_timeMillis is null")
        .run(dateTimeFns.dateStringToInteger(reqBody.remarkDateString), dateTimeFns.timeStringToInteger(reqBody.remarkTimeString), reqBody.remark, reqBody.isImportant ? 1 : 0, reqSession.user.userName, nowMillis, reqBody.organizationID, reqBody.remarkIndex);
    db.close();
    return info.changes > 0;
};
exports.updateOrganizationRemark = updateOrganizationRemark;
