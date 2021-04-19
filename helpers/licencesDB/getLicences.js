import sqlite from "better-sqlite3";
import { licencesDB as dbPath } from "../../data/databasePaths.js";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import { canUpdateObject } from "../licencesDB.js";
export const getLicences = (reqBodyOrParamsObj, reqSession, includeOptions) => {
    if (reqBodyOrParamsObj.organizationName && reqBodyOrParamsObj.organizationName !== "") {
        includeOptions.includeOrganization = true;
    }
    const db = sqlite(dbPath, {
        readonly: true
    });
    const sqlParams = [];
    let sqlWhereClause = " where l.recordDelete_timeMillis is null";
    if (reqBodyOrParamsObj.externalLicenceNumber && reqBodyOrParamsObj.externalLicenceNumber !== "") {
        const externalLicenceNumberPieces = reqBodyOrParamsObj.externalLicenceNumber.toLowerCase().split(" ");
        for (const externalLicenceNumberPiece of externalLicenceNumberPieces) {
            sqlWhereClause += " and instr(lower(l.externalLicenceNumber), ?)";
            sqlParams.push(externalLicenceNumberPiece);
        }
    }
    if (reqBodyOrParamsObj.organizationID && reqBodyOrParamsObj.organizationID !== "") {
        sqlWhereClause += " and l.organizationID = ?";
        sqlParams.push(reqBodyOrParamsObj.organizationID);
    }
    if (reqBodyOrParamsObj.organizationName && reqBodyOrParamsObj.organizationName !== "") {
        const organizationNamePieces = reqBodyOrParamsObj.organizationName.toLowerCase().split(" ");
        for (const organizationNamePiece of organizationNamePieces) {
            sqlWhereClause += " and instr(lower(o.organizationName), ?)";
            sqlParams.push(organizationNamePiece);
        }
    }
    if (reqBodyOrParamsObj.licenceTypeKey && reqBodyOrParamsObj.licenceTypeKey !== "") {
        sqlWhereClause += " and l.licenceTypeKey = ?";
        sqlParams.push(reqBodyOrParamsObj.licenceTypeKey);
    }
    if (reqBodyOrParamsObj.licenceStatus) {
        if (reqBodyOrParamsObj.licenceStatus === "past") {
            sqlWhereClause += " and l.endDate < ?";
            sqlParams.push(dateTimeFns.dateToInteger(new Date()));
        }
        else if (reqBodyOrParamsObj.licenceStatus === "active") {
            sqlWhereClause += " and l.endDate >= ?";
            sqlParams.push(dateTimeFns.dateToInteger(new Date()));
        }
    }
    if (reqBodyOrParamsObj.locationID) {
        sqlWhereClause += " and (l.locationID = ?" +
            " or l.licenceID in (" +
            "select licenceID from LotteryLicenceTicketTypes" +
            " where recordDelete_timeMillis is null and (distributorLocationID = ? or manufacturerLocationID = ?)" +
            ")" +
            ")";
        sqlParams.push(reqBodyOrParamsObj.locationID);
        sqlParams.push(reqBodyOrParamsObj.locationID);
        sqlParams.push(reqBodyOrParamsObj.locationID);
    }
    if (reqBodyOrParamsObj.locationName && reqBodyOrParamsObj.locationName !== "") {
        const locationNamePieces = reqBodyOrParamsObj.locationName.toLowerCase().split(" ");
        for (const locationNamePiece of locationNamePieces) {
            sqlWhereClause += " and (instr(lower(lo.locationName), ?) or instr(lower(lo.locationAddress1), ?))";
            sqlParams.push(locationNamePiece);
            sqlParams.push(locationNamePiece);
        }
    }
    let count = 0;
    if (includeOptions.limit !== -1) {
        count = db.prepare("select ifnull(count(*), 0)" +
            " from LotteryLicences l" +
            " left join Organizations o on l.organizationID = o.organizationID" +
            " left join Locations lo on l.locationID = lo.locationID" +
            sqlWhereClause)
            .pluck()
            .get(sqlParams);
    }
    let sql = "select" +
        " 'licence' as recordType," +
        " l.licenceID, l.organizationID," +
        (includeOptions.includeOrganization
            ? " o.organizationName,"
            : "") +
        " l.applicationDate, userFn_dateIntegerToString(l.applicationDate) as applicationDateString," +
        " l.licenceTypeKey," +
        " l.startDate, userFn_dateIntegerToString(l.startDate) as startDateString," +
        " l.startTime, userFn_timeIntegerToString(l.startTime) as startTimeString," +
        " l.endDate, userFn_dateIntegerToString(l.endDate) as endDateString," +
        " l.endTime, userFn_timeIntegerToString(l.endTime) as endTimeString," +
        " l.locationID, lo.locationName, lo.locationAddress1," +
        " iif(lo.locationName = '', lo.locationAddress1, lo.locationName) as locationDisplayName," +
        " l.municipality, l.licenceDetails, l.termsConditions," +
        " l.externalLicenceNumber," +
        " l.issueDate, userFn_dateIntegerToString(l.issueDate) as issueDateString," +
        " l.recordCreate_userName, l.recordCreate_timeMillis," +
        " l.recordUpdate_userName, l.recordUpdate_timeMillis" +
        " from LotteryLicences l" +
        " left join Locations lo on l.locationID = lo.locationID" +
        (includeOptions.includeOrganization
            ? " left join Organizations o on l.organizationID = o.organizationID"
            : "") +
        sqlWhereClause +
        " order by l.endDate desc, l.startDate desc, l.licenceID";
    if (includeOptions.limit !== -1) {
        sql += " limit " + includeOptions.limit.toString() +
            " offset " + (includeOptions.offset || 0).toString();
    }
    db.function("userFn_dateIntegerToString", dateTimeFns.dateIntegerToString);
    db.function("userFn_timeIntegerToString", dateTimeFns.timeIntegerToString);
    const rows = db.prepare(sql)
        .all(sqlParams);
    db.close();
    for (const ele of rows) {
        ele.canUpdate = canUpdateObject(ele, reqSession);
    }
    return {
        count: (includeOptions.limit === -1 ? rows.length : count),
        licences: rows
    };
};
