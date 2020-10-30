"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLicenceActivityByDateRange = exports.deleteEvent = exports.updateEvent = exports.getPastEventBankingInformation = exports.getEventFinancialSummary = exports.getOutstandingEvents = exports.getRecentlyUpdateEvents = exports.getEvents = exports.getEventTableStats = exports.getActiveLicenceSummary = exports.getLicenceTypeSummary = exports.getLicenceTableStats = exports.resetLicenceTableStats = exports.resetEventTableStats = exports.getRawRowsColumns = exports.canUpdateObject = void 0;
const sqlite = require("better-sqlite3");
const configFns = require("./configFns");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const databasePaths_1 = require("../data/databasePaths");
exports.canUpdateObject = (obj, reqSession) => {
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
        (obj.recordCreate_userName === reqSession.user.userName ||
            obj.recordUpdate_userName === reqSession.user.userName) &&
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
                if (obj.bank_name !== "" && obj.costs_receipts) {
                    canUpdate = false;
                }
                break;
        }
    }
    return canUpdate;
};
exports.getRawRowsColumns = (sql, params) => {
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
let licenceTableStats = {
    applicationYearMin: 1990,
    startYearMin: 1990,
    endYearMax: new Date().getFullYear() + 1
};
let licenceTableStatsExpiryMillis = -1;
exports.resetEventTableStats = () => {
    eventTableStatsExpiryMillis = -1;
};
exports.resetLicenceTableStats = () => {
    licenceTableStatsExpiryMillis = -1;
};
let eventTableStats = {
    eventYearMin: 1970
};
let eventTableStatsExpiryMillis = -1;
exports.getLicenceTableStats = () => {
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
exports.getLicenceTypeSummary = (reqBody) => {
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
exports.getActiveLicenceSummary = (reqBody, reqSession) => {
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
exports.getEventTableStats = () => {
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
exports.getEvents = (reqBody, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB, {
        readonly: true
    });
    const sqlParams = [reqBody.eventYear, reqBody.eventYear];
    let sql = "select e.eventDate, e.bank_name, e.costs_receipts," +
        " l.licenceID, l.externalLicenceNumber, l.licenceTypeKey, l.licenceDetails," +
        " lo.locationName, lo.locationAddress1," +
        " l.startTime, l.endTime," +
        " o.organizationName," +
        " e.recordCreate_userName, e.recordCreate_timeMillis, e.recordUpdate_userName, e.recordUpdate_timeMillis" +
        " from LotteryEvents e" +
        " left join LotteryLicences l on e.licenceID = l.licenceID" +
        " left join Locations lo on l.locationID = lo.locationID" +
        " left join Organizations o on l.organizationID = o.organizationID" +
        " where e.recordDelete_timeMillis is null" +
        " and l.recordDelete_timeMillis is null" +
        " and e.eventDate > (? * 10000)" +
        " and e.eventDate < (? * 10000) + 9999";
    if (reqBody.externalLicenceNumber !== "") {
        sql += " and instr(lower(l.externalLicenceNumber), ?) > 0";
        sqlParams.push(reqBody.externalLicenceNumber);
    }
    if (reqBody.licenceTypeKey !== "") {
        sql += " and l.licenceTypeKey = ?";
        sqlParams.push(reqBody.licenceTypeKey);
    }
    if (reqBody.organizationName !== "") {
        const organizationNamePieces = reqBody.organizationName.toLowerCase().split(" ");
        for (const organizationNamePiece of organizationNamePieces) {
            sql += " and instr(lower(o.organizationName), ?)";
            sqlParams.push(organizationNamePiece);
        }
    }
    if (reqBody.locationName !== "") {
        const locationNamePieces = reqBody.locationName.toLowerCase().split(" ");
        for (const locationNamePiece of locationNamePieces) {
            sql += " and (instr(lower(lo.locationName), ?) or instr(lower(lo.locationAddress1), ?))";
            sqlParams.push(locationNamePiece);
            sqlParams.push(locationNamePiece);
        }
    }
    sql += " order by e.eventDate, l.startTime";
    const events = db.prepare(sql)
        .all(sqlParams);
    db.close();
    for (const lotteryEvent of events) {
        lotteryEvent.recordType = "event";
        lotteryEvent.eventDateString = dateTimeFns.dateIntegerToString(lotteryEvent.eventDate);
        lotteryEvent.startTimeString = dateTimeFns.timeIntegerToString(lotteryEvent.startTime || 0);
        lotteryEvent.endTimeString = dateTimeFns.timeIntegerToString(lotteryEvent.endTime || 0);
        lotteryEvent.locationDisplayName =
            (lotteryEvent.locationName === "" ? lotteryEvent.locationAddress1 : lotteryEvent.locationName);
        lotteryEvent.canUpdate = exports.canUpdateObject(lotteryEvent, reqSession);
        delete lotteryEvent.locationName;
        delete lotteryEvent.locationAddress1;
        delete lotteryEvent.bank_name;
        delete lotteryEvent.costs_receipts;
    }
    return events;
};
exports.getRecentlyUpdateEvents = (reqSession) => {
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
exports.getOutstandingEvents = (reqBody, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB, {
        readonly: true
    });
    const sqlParams = [];
    let sql = "select" +
        " o.organizationID, o.organizationName," +
        " e.eventDate, e.reportDate," +
        " l.licenceTypeKey, l.licenceID, l.externalLicenceNumber," +
        " e.bank_name, e.bank_address, e.bank_accountNumber, e.bank_accountBalance," +
        " e.costs_receipts," +
        " e.recordUpdate_userName, e.recordUpdate_timeMillis" +
        " from LotteryEvents e" +
        " left join LotteryLicences l on e.licenceID = l.licenceID" +
        " left join Organizations o on l.organizationID = o.organizationID" +
        " where e.recordDelete_timeMillis is null" +
        " and l.recordDelete_timeMillis is null" +
        (" and (" +
            "e.reportDate is null or e.reportDate = 0" +
            ")");
    if (reqBody.licenceTypeKey && reqBody.licenceTypeKey !== "") {
        sql += " and l.licenceTypeKey = ?";
        sqlParams.push(reqBody.licenceTypeKey);
    }
    if (reqBody.eventDateType) {
        const currentDate = dateTimeFns.dateToInteger(new Date());
        if (reqBody.eventDateType === "past") {
            sql += " and e.eventDate < ?";
            sqlParams.push(currentDate);
        }
        else if (reqBody.eventDateType === "upcoming") {
            sql += " and e.eventDate >= ?";
            sqlParams.push(currentDate);
        }
    }
    sql += " order by o.organizationName, o.organizationID, e.eventDate, l.licenceID";
    const events = db.prepare(sql).all(sqlParams);
    db.close();
    for (const lotteryEvent of events) {
        lotteryEvent.recordType = "event";
        lotteryEvent.eventDateString = dateTimeFns.dateIntegerToString(lotteryEvent.eventDate);
        lotteryEvent.reportDateString = dateTimeFns.dateIntegerToString(lotteryEvent.reportDate);
        lotteryEvent.licenceType = (configFns.getLicenceType(lotteryEvent.licenceTypeKey) || {}).licenceType || "";
        lotteryEvent.bank_name_isOutstanding = (lotteryEvent.bank_name === null || lotteryEvent.bank_name === "");
        lotteryEvent.canUpdate = exports.canUpdateObject(lotteryEvent, reqSession);
    }
    return events;
};
exports.getEventFinancialSummary = (reqBody) => {
    const db = sqlite(databasePaths_1.licencesDB, {
        readonly: true
    });
    const sqlParams = [];
    let sql = "select licenceTypeKey," +
        " count(licenceID) as licenceCount," +
        " sum(eventCount) as eventCount," +
        " sum(reportDateCount) as reportDateCount," +
        " sum(ifnull(licenceFee, 0)) as licenceFeeSum," +
        " sum(costs_receiptsSum) as costs_receiptsSum," +
        " sum(costs_adminSum) as costs_adminSum," +
        " sum(costs_prizesAwardedSum) as costs_prizesAwardedSum," +
        " sum(costs_receiptsSum - costs_adminSum - costs_prizesAwardedSum) as costs_netProceedsSum," +
        " sum(costs_amountDonatedSum) as costs_amountDonatedSum" +
        " from (" +
        "select l.licenceID, l.licenceTypeKey, l.licenceFee," +
        " count(*) as eventCount," +
        " sum(case when (e.reportDate is null or e.reportDate = 0) then 0 else 1 end) as reportDateCount," +
        " sum(ifnull(e.costs_receipts, 0)) as costs_receiptsSum," +
        " sum(ifnull(e.costs_admin,0)) as costs_adminSum," +
        " sum(ifnull(e.costs_prizesAwarded,0)) as costs_prizesAwardedSum," +
        " sum(ifnull(e.costs_amountDonated,0)) as costs_amountDonatedSum" +
        " from LotteryLicences l" +
        " left join LotteryEvents e on l.licenceID = e.licenceID and e.recordDelete_timeMillis is null" +
        " where l.recordDelete_timeMillis is null";
    if (reqBody.eventDateStartString && reqBody.eventDateStartString !== "") {
        sql += " and e.eventDate >= ?";
        sqlParams.push(dateTimeFns.dateStringToInteger(reqBody.eventDateStartString));
    }
    if (reqBody.eventDateEndString && reqBody.eventDateEndString !== "") {
        sql += " and e.eventDate <= ?";
        sqlParams.push(dateTimeFns.dateStringToInteger(reqBody.eventDateEndString));
    }
    sql += " group by l.licenceID, l.licenceTypeKey, l.licenceFee" +
        " ) t" +
        " group by licenceTypeKey";
    const rows = db.prepare(sql).all(sqlParams);
    db.close();
    return rows;
};
exports.getPastEventBankingInformation = (licenceID) => {
    const db = sqlite(databasePaths_1.licencesDB, {
        readonly: true
    });
    const organizationID = db.prepare("select organizationID from LotteryLicences" +
        " where licenceID = ?")
        .get(licenceID)
        .organizationID;
    const cutoffDateInteger = dateTimeFns.dateToInteger(new Date()) - 50000;
    const bankInfoList = db.prepare("select bank_name, bank_address, bank_accountNumber," +
        " max(eventDate) as eventDateMax" +
        " from LotteryEvents" +
        (" where licenceID in (" +
            "select licenceID from LotteryLicences where organizationID = ? and recordDelete_timeMillis is null)") +
        " and licenceID <> ?" +
        " and eventDate >= ?" +
        " and recordDelete_timeMillis is null" +
        " and bank_name is not null and bank_name <> ''" +
        " and bank_address is not null and bank_address <> ''" +
        " and bank_accountNumber is not null and bank_accountNumber <> ''" +
        " group by bank_name, bank_address, bank_accountNumber" +
        " order by max(eventDate) desc")
        .all(organizationID, licenceID, cutoffDateInteger);
    db.close();
    for (const record of bankInfoList) {
        record.eventDateMaxString = dateTimeFns.dateIntegerToString(record.eventDateMax);
    }
    return bankInfoList;
};
exports.updateEvent = (reqBody, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB);
    const nowMillis = Date.now();
    const info = db.prepare("update LotteryEvents" +
        " set reportDate = ?," +
        " bank_name = ?," +
        " bank_address = ?," +
        " bank_accountNumber = ?," +
        " bank_accountBalance = ?," +
        " costs_receipts = ?," +
        " costs_admin = ?," +
        " costs_prizesAwarded = ?," +
        " costs_amountDonated = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where licenceID = ?" +
        " and eventDate = ?" +
        " and recordDelete_timeMillis is null")
        .run(dateTimeFns.dateStringToInteger(reqBody.reportDateString), reqBody.bank_name, reqBody.bank_address, reqBody.bank_accountNumber, reqBody.bank_accountBalance, reqBody.costs_receipts, reqBody.costs_admin, reqBody.costs_prizesAwarded, reqBody.costs_amountDonated, reqSession.user.userName, nowMillis, reqBody.licenceID, reqBody.eventDate);
    const changeCount = info.changes;
    if (!changeCount) {
        db.close();
        return false;
    }
    db.prepare("delete from LotteryEventFields" +
        " where licenceID = ?" +
        " and eventDate = ?")
        .run(reqBody.licenceID, reqBody.eventDate);
    const fieldKeys = reqBody.fieldKeys.substring(1).split(",");
    for (const fieldKey of fieldKeys) {
        const fieldValue = reqBody[fieldKey];
        if (fieldValue !== "") {
            db.prepare("insert into LotteryEventFields" +
                " (licenceID, eventDate, fieldKey, fieldValue)" +
                " values (?, ?, ?, ?)")
                .run(reqBody.licenceID, reqBody.eventDate, fieldKey, fieldValue);
        }
    }
    db.close();
    eventTableStatsExpiryMillis = -1;
    return changeCount > 0;
};
exports.deleteEvent = (licenceID, eventDate, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB);
    const nowMillis = Date.now();
    const info = db.prepare("update LotteryEvents" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where licenceID = ?" +
        " and eventDate = ?" +
        " and recordDelete_timeMillis is null")
        .run(reqSession.user.userName, nowMillis, licenceID, eventDate);
    const changeCount = info.changes;
    db.close();
    eventTableStatsExpiryMillis = -1;
    return changeCount > 0;
};
exports.getLicenceActivityByDateRange = (startDate, endDate, _reqBody) => {
    const db = sqlite(databasePaths_1.licencesDB, {
        readonly: true
    });
    const activity = {
        startDateString: dateTimeFns.dateIntegerToString(startDate),
        endDateString: dateTimeFns.dateIntegerToString(endDate),
        licences: null,
        events: null
    };
    activity.licences =
        db.prepare("select l.licenceID, l.externalLicenceNumber," +
            " l.startDate, l.endDate," +
            " l.licenceTypeKey, l.licenceDetails," +
            " o.organizationName, lo.locationName, lo.locationAddress1" +
            " from LotteryLicences l" +
            " left join Organizations o on l.organizationID = o.organizationID" +
            " left join Locations lo on l.locationID = lo.locationID" +
            " where l.recordDelete_timeMillis is null" +
            " and (" +
            "? between l.startDate and l.endDate" +
            " or ? between l.startDate and l.endDate" +
            " or l.startDate between ? and ?" +
            " or l.endDate between ? and ?)" +
            " order by l.endDate, l.startDate")
            .all(startDate, endDate, startDate, endDate, startDate, endDate);
    for (const record of activity.licences) {
        record.startDateString = dateTimeFns.dateIntegerToString(record.startDate);
        record.endDateString = dateTimeFns.dateIntegerToString(record.endDate);
    }
    activity.events =
        db.prepare("select e.eventDate, l.licenceID, l.externalLicenceNumber," +
            " l.startTime, l.endTime," +
            " l.licenceTypeKey, l.licenceDetails," +
            " o.organizationName, lo.locationName, lo.locationAddress1" +
            " from LotteryEvents e" +
            " left join LotteryLicences l on e.licenceId = l.licenceID" +
            " left join Organizations o on l.organizationID = o.organizationID" +
            " left join Locations lo on l.locationID = lo.locationID" +
            " where l.recordDelete_timeMillis is null" +
            " and e.recordDelete_timeMillis is null" +
            " and e.eventDate between ? and ?" +
            " order by l.startTime, l.endTime")
            .all(startDate, endDate);
    for (const record of activity.events) {
        record.eventDateString = dateTimeFns.dateIntegerToString(record.eventDate);
        record.startTimeString = dateTimeFns.timeIntegerToString(record.startTime);
        record.endTimeString = dateTimeFns.timeIntegerToString(record.endTime);
    }
    db.close();
    return activity;
};
