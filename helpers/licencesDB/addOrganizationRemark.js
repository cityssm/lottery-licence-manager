"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addOrganizationRemark = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const addOrganizationRemark = (reqBody, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB);
    const row = db.prepare("select ifnull(max(remarkIndex), -1) as maxIndex" +
        " from OrganizationRemarks" +
        " where organizationID = ?")
        .get(reqBody.organizationID);
    const newRemarkIndex = row.maxIndex + 1;
    const rightNow = new Date();
    const remarkDate = dateTimeFns.dateToInteger(rightNow);
    const remarkTime = dateTimeFns.dateToTimeInteger(rightNow);
    db.prepare("insert into OrganizationRemarks (" +
        "organizationID, remarkIndex," +
        " remarkDate, remarkTime, remark, isImportant," +
        " recordCreate_userName, recordCreate_timeMillis," +
        " recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(reqBody.organizationID, newRemarkIndex, remarkDate, remarkTime, reqBody.remark, 0, reqSession.user.userName, rightNow.getTime(), reqSession.user.userName, rightNow.getTime());
    db.close();
    return newRemarkIndex;
};
exports.addOrganizationRemark = addOrganizationRemark;
