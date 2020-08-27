"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrganizationRemarks = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const licencesDB_1 = require("../licencesDB");
exports.getOrganizationRemarks = (organizationID, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB, {
        readonly: true
    });
    const remarks = db.prepare("select remarkIndex," +
        " remarkDate, remarkTime," +
        " remark, isImportant," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis" +
        " from OrganizationRemarks" +
        " where recordDelete_timeMillis is null" +
        " and organizationID = ?" +
        " order by remarkDate desc, remarkTime desc")
        .all(organizationID);
    db.close();
    for (const remark of remarks) {
        remark.recordType = "remark";
        remark.remarkDateString = dateTimeFns.dateIntegerToString(remark.remarkDate || 0);
        remark.remarkTimeString = dateTimeFns.timeIntegerToString(remark.remarkTime || 0);
        remark.canUpdate = licencesDB_1.canUpdateObject(remark, reqSession);
    }
    return remarks;
};
