"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentlyUpdateEvents = exports.getEventTableStats = exports.getActiveLicenceSummary = exports.getLicenceTypeSummary = exports.getLicenceTableStats = exports.resetLicenceTableStats = exports.resetEventTableStats = exports.getRawRowsColumns = exports.canUpdateObject = void 0;
const sqlite = require("better-sqlite3");
const configFns = require("./configFns");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const databasePaths_1 = require("../data/databasePaths");
const canUpdateObject = (obj, reqSession) => {
    const userProperties = reqSession.user.userProperties;
    let canUpdate = false;
    if (!reqSession) {
        canUpdate = false;
    }
    else if (obj.recordDelete_timeMillis) {
        canUpdate = false;
    }
    else if (userProperties.canUpdate) {
        canUpdate = true;
    }
    else if (userProperties.canCreate &&
        (obj.recordCreate_userName === reqSession.user.userName || obj.recordUpdate_userName === reqSession.user.userName) &&
        obj.recordUpdate_timeMillis + configFns.getProperty("user.createUpdateWindowMillis") > Date.now()) {
        canUpdate = true;
    }
    if (obj.recordUpdate_timeMillis + configFns.getProperty("user.createUpdateWindowMillis") > Date.now()) {
        return canUpdate;
    }
    if (canUpdate) {
        switch (obj.recordType) {
            case "licence":
                const lockDate = new Date();
                lockDate.setMonth(lockDate.getMonth() - 1);
                const lockDateInteger = dateTimeFns.dateToInteger(lockDate);
                if (obj.endDate < lockDateInteger) {
                    canUpdate = false;
                }
                break;
            case "event":
                if (obj.bank_name !== "" && obj.reportDate) {
                    canUpdate = false;
                }
                break;
        }
    }
    return canUpdate;
};
exports.canUpdateObject = canUpdateObject;
const getRawRowsColumns = (sql, params) => {
    const db = sqlite(databasePaths_1.licencesDB, {
        readonly: true
    });
    const stmt = db.prepare(sql);
    stmt.raw(true);
    const rows = stmt.all(params);
    const columns = stmt.columns();
    stmt.raw(false);
    db.close();
    return {
        rows,
        columns
    };
};
exports.getRawRowsColumns = getRawRowsColumns;
let licenceTableStats = {
    applicationYearMin: 1990,
    startYearMin: 1990,
    endYearMax: new Date().getFullYear() + 1
};
let licenceTableStatsExpiryMillis = -1;
const resetEventTableStats = () => {
    eventTableStatsExpiryMillis = -1;
};
exports.resetEventTableStats = resetEventTableStats;
const resetLicenceTableStats = () => {
    licenceTableStatsExpiryMillis = -1;
};
exports.resetLicenceTableStats = resetLicenceTableStats;
let eventTableStats = {
    eventYearMin: 1970
};
let eventTableStatsExpiryMillis = -1;
const getLicenceTableStats = () => {
    if (Date.now() < licenceTableStatsExpiryMillis) {
        return licenceTableStats;
    }
    const db = sqlite(databasePaths_1.licencesDB, {
        readonly: true
    });
    licenceTableStats = db.prepare("select" +
        " min(applicationDate / 10000) as applicationYearMin," +
        " min(startDate / 10000) as startYearMin," +
        " max(endDate / 10000) as endYearMax" +
        " from LotteryLicences" +
        " where recordDelete_timeMillis is null")
        .get();
    licenceTableStatsExpiryMillis = Date.now() + (3600 * 1000);
    db.close();
    return licenceTableStats;
};
exports.getLicenceTableStats = getLicenceTableStats;
const getLicenceTypeSummary = (reqBody) => {
    const db = sqlite(databasePaths_1.licencesDB, {
        readonly: true
    });
    const sqlParams = [];
    let sql = "select l.licenceID, l.externalLicenceNumber," +
        " l.applicationDate, l.issueDate," +
        " o.organizationName, lo.locationName, lo.locationAddress1," +
        " l.licenceTypeKey, l.totalPrizeValue, l.licenceFee," +
        " sum(t.transactionAmount) as transactionAmountSum" +
        " from LotteryLicences l" +
        " left join Organizations o on l.organizationID = o.organizationID" +
        " left join Locations lo on l.locationID = lo.locationID" +
        " left join LotteryLicenceTransactions t on l.licenceID = t.licenceID and t.recordDelete_timeMillis is null" +
        " where l.recordDelete_timeMillis is null";
    if (reqBody.applicationDateStartString && reqBody.applicationDateStartString !== "") {
        const applicationDateStart = dateTimeFns.dateStringToInteger(reqBody.applicationDateStartString);
        sql += " and l.applicationDate >= ?";
        sqlParams.push(applicationDateStart);
    }
    if (reqBody.applicationDateEndString && reqBody.applicationDateEndString !== "") {
        const applicationDateEnd = dateTimeFns.dateStringToInteger(reqBody.applicationDateEndString);
        sql += " and l.applicationDate <= ?";
        sqlParams.push(applicationDateEnd);
    }
    if (reqBody.licenceTypeKey && reqBody.licenceTypeKey !== "") {
        sql += " and l.licenceTypeKey = ?";
        sqlParams.push(reqBody.licenceTypeKey);
    }
    sql += " group by l.licenceID, l.externalLicenceNumber," +
        " l.applicationDate, l.issueDate," +
        " o.organizationName, lo.locationName, lo.locationAddress1," +
        " l.licenceTypeKey, l.totalPrizeValue, l.licenceFee" +
        " order by o.organizationName, o.organizationID, l.applicationDate, l.externalLicenceNumber";
    const rows = db.prepare(sql).all(sqlParams);
    db.close();
    for (const record of rows) {
        record.applicationDateString = dateTimeFns.dateIntegerToString(record.applicationDate);
        record.issueDateString = dateTimeFns.dateIntegerToString(record.issueDate);
        record.locationDisplayName =
            record.locationName === "" ? record.locationAddress1 : record.locationName;
        record.licenceType = (configFns.getLicenceType(record.licenceTypeKey) || {}).licenceType || "";
    }
    return rows;
};
exports.getLicenceTypeSummary = getLicenceTypeSummary;
const getActiveLicenceSummary = (reqBody, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB, {
        readonly: true
    });
    const startEndDateStart = dateTimeFns.dateStringToInteger(reqBody.startEndDateStartString);
    const startEndDateEnd = dateTimeFns.dateStringToInteger(reqBody.startEndDateEndString);
    const sql = "select l.licenceID, l.externalLicenceNumber," +
        " l.issueDate, l.startDate, l.endDate, l.licenceTypeKey," +
        " o.organizationID, o.organizationName," +
        " lo.locationID, lo.locationName, lo.locationAddress1," +
        " l.recordCreate_userName, l.recordCreate_timeMillis, l.recordUpdate_userName, l.recordUpdate_timeMillis" +
        " from LotteryLicences l" +
        " left join Organizations o on l.organizationID = o.organizationID" +
        " left join Locations lo on l.locationID = lo.locationID" +
        " where l.recordDelete_timeMillis is null" +
        " and l.issueDate is not null" +
        " and (" +
        "(l.startDate <= ? and l.endDate >= ?)" +
        " or (l.startDate <= ? and l.endDate >= ?)" +
        " or (l.startDate >= ? and l.endDate <= ?)" +
        ")";
    const sqlParams = [startEndDateStart, startEndDateStart,
        startEndDateEnd, startEndDateEnd,
        startEndDateStart, startEndDateEnd];
    const licences = db.prepare(sql).all(sqlParams);
    db.close();
    for (const licence of licences) {
        licence.recordType = "licence";
        licence.startDateString = dateTimeFns.dateIntegerToString(licence.startDate || 0);
        licence.endDateString = dateTimeFns.dateIntegerToString(licence.endDate || 0);
        licence.issueDateString = dateTimeFns.dateIntegerToString(licence.issueDate || 0);
        licence.locationDisplayName =
            (licence.locationName === "" ? licence.locationAddress1 : licence.locationName);
        licence.canUpdate = exports.canUpdateObject(licence, reqSession);
    }
    return licences;
};
exports.getActiveLicenceSummary = getActiveLicenceSummary;
const getEventTableStats = () => {
    if (Date.now() < eventTableStatsExpiryMillis) {
        return eventTableStats;
    }
    const db = sqlite(databasePaths_1.licencesDB, {
        readonly: true
    });
    eventTableStats = db.prepare("select" +
        " min(eventDate / 10000) as eventYearMin," +
        " max(eventDate / 10000) as eventYearMax" +
        " from LotteryEvents" +
        " where recordDelete_timeMillis is null" +
        " and eventDate > 19700000")
        .get();
    eventTableStatsExpiryMillis = Date.now() + (3600 * 1000);
    db.close();
    return eventTableStats;
};
exports.getEventTableStats = getEventTableStats;
const getRecentlyUpdateEvents = (reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB, {
        readonly: true
    });
    const events = db.prepare("select e.eventDate, e.reportDate," +
        " l.licenceID, l.externalLicenceNumber, l.licenceTypeKey, l.licenceDetails," +
        " o.organizationName," +
        " e.recordCreate_userName, e.recordCreate_timeMillis, e.recordUpdate_userName, e.recordUpdate_timeMillis" +
        " from LotteryEvents e" +
        " left join LotteryLicences l on e.licenceID = l.licenceID" +
        " left join Locations lo on l.locationID = lo.locationID" +
        " left join Organizations o on l.organizationID = o.organizationID" +
        " where e.recordDelete_timeMillis is null" +
        " and l.recordDelete_timeMillis is null" +
        " and o.recordDelete_timeMillis is null" +
        " order by e.recordUpdate_timeMillis desc" +
        " limit 100")
        .all();
    db.close();
    for (const lotteryEvent of events) {
        lotteryEvent.recordType = "event";
        lotteryEvent.eventDateString = dateTimeFns.dateIntegerToString(lotteryEvent.eventDate);
        lotteryEvent.reportDateString = dateTimeFns.dateIntegerToString(lotteryEvent.reportDate);
        lotteryEvent.recordUpdate_dateString = dateTimeFns.dateToString(new Date(lotteryEvent.recordUpdate_timeMillis));
        lotteryEvent.recordUpdate_timeString = dateTimeFns.dateToTimeString(new Date(lotteryEvent.recordUpdate_timeMillis));
        lotteryEvent.canUpdate = exports.canUpdateObject(lotteryEvent, reqSession);
    }
    return events;
};
exports.getRecentlyUpdateEvents = getRecentlyUpdateEvents;
