"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrganizations = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const licencesDB_1 = require("../licencesDB");
exports.getOrganizations = (reqBody, reqSession, includeOptions) => {
    const db = sqlite(databasePaths_1.licencesDB, {
        readonly: true
    });
    const sqlParams = [dateTimeFns.dateToInteger(new Date())];
    let sql = "select o.organizationID, o.organizationName, o.isEligibleForLicences, o.organizationNote," +
        " r.representativeName," +
        " sum(case when l.endDate >= ? then 1 else 0 end) as licences_activeCount," +
        " max(l.endDate) as licences_endDateMax," +
        " o.recordCreate_userName, o.recordCreate_timeMillis, o.recordUpdate_userName, o.recordUpdate_timeMillis" +
        " from Organizations o" +
        " left join OrganizationRepresentatives r on o.organizationID = r.organizationID and r.isDefault = 1" +
        " left join LotteryLicences l on o.organizationID = l.organizationID and l.recordDelete_timeMillis is null" +
        " where o.recordDelete_timeMillis is null";
    if (reqBody.organizationName && reqBody.organizationName !== "") {
        const organizationNamePieces = reqBody.organizationName.toLowerCase().split(" ");
        for (const organizationPiece of organizationNamePieces) {
            sql += " and instr(lower(o.organizationName), ?)";
            sqlParams.push(organizationPiece);
        }
    }
    if (reqBody.representativeName && reqBody.representativeName !== "") {
        const representativeNamePieces = reqBody.representativeName.toLowerCase().split(" ");
        for (const representativePiece of representativeNamePieces) {
            sql += " and o.organizationID in (" +
                "select organizationID from OrganizationRepresentatives where instr(lower(representativeName), ?)" +
                ")";
            sqlParams.push(representativePiece);
        }
    }
    if (reqBody.isEligibleForLicences && reqBody.isEligibleForLicences !== "") {
        sql += " and o.isEligibleForLicences = ?";
        sqlParams.push(reqBody.isEligibleForLicences);
    }
    if (reqBody.organizationIsActive && reqBody.organizationIsActive !== "") {
        const currentDate = dateTimeFns.dateToInteger(new Date());
        sql += " and o.organizationID in (" +
            "select lx.organizationID from LotteryLicences lx" +
            " where lx.recordDelete_timeMillis is null" +
            " and lx.issueDate is not null and lx.endDate >= ?)";
        sqlParams.push(currentDate);
    }
    sql += " group by o.organizationID, o.organizationName, o.isEligibleForLicences, o.organizationNote," +
        " r.representativeName," +
        " o.recordCreate_userName, o.recordCreate_timeMillis, o.recordUpdate_userName, o.recordUpdate_timeMillis" +
        " order by o.organizationName, o.organizationID";
    if (includeOptions.limit !== -1) {
        sql += " limit " + includeOptions.limit.toString() +
            " offset " + includeOptions.offset.toString();
    }
    const rows = db.prepare(sql).all(sqlParams);
    db.close();
    for (const ele of rows) {
        ele.recordType = "organization";
        ele.licences_endDateMaxString = dateTimeFns.dateIntegerToString(ele.licences_endDateMax || 0);
        ele.canUpdate = licencesDB_1.canUpdateObject(ele, reqSession);
        delete ele.recordCreate_userName;
        delete ele.recordCreate_timeMillis;
        delete ele.recordUpdate_userName;
        delete ele.recordUpdate_timeMillis;
    }
    return rows;
};