"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateApplicationSetting = exports.getApplicationSetting = exports.getApplicationSettings = exports.getLicenceActivityByDateRange = exports.pokeEvent = exports.deleteEvent = exports.updateEvent = exports.getPastEventBankingInformation = exports.getEvent = exports.getEventFinancialSummary = exports.getOutstandingEvents = exports.getRecentlyUpdateEvents = exports.getEvents = exports.getEventTableStats = exports.voidTransaction = exports.addTransaction = exports.getActiveLicenceSummary = exports.getLicenceTypeSummary = exports.unissueLicence = exports.issueLicence = exports.pokeLicence = exports.getDistinctTermsConditions = exports.deleteLicence = exports.updateLicence = exports.createLicence = exports.getNextExternalLicenceNumberFromRange = exports.getLicence = exports.getLicences = exports.getLicenceTableStats = exports.getRawRowsColumns = exports.canUpdateObject = exports.dbPath = void 0;
const sqlite = require("better-sqlite3");
const configFns = require("./configFns");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
exports.dbPath = "data/licences.db";
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
const getApplicationSettingWithDB = (db, settingKey) => {
    const row = db.prepare("select settingValue" +
        " from ApplicationSettings" +
        " where settingKey = ?")
        .get(settingKey);
    if (row) {
        return row.settingValue || "";
    }
    return "";
};
const getLicenceWithDB = (db, licenceID, reqSession, queryOptions) => {
    const licenceObj = db.prepare("select l.*," +
        " lo.locationName, lo.locationAddress1" +
        " from LotteryLicences l" +
        " left join Locations lo on l.locationID = lo.locationID" +
        " where l.recordDelete_timeMillis is null" +
        " and l.licenceID = ?")
        .get(licenceID);
    if (!licenceObj) {
        return null;
    }
    licenceObj.recordType = "licence";
    licenceObj.applicationDateString = dateTimeFns.dateIntegerToString(licenceObj.applicationDate || 0);
    licenceObj.startDateString = dateTimeFns.dateIntegerToString(licenceObj.startDate || 0);
    licenceObj.endDateString = dateTimeFns.dateIntegerToString(licenceObj.endDate || 0);
    licenceObj.startTimeString = dateTimeFns.timeIntegerToString(licenceObj.startTime || 0);
    licenceObj.endTimeString = dateTimeFns.timeIntegerToString(licenceObj.endTime || 0);
    licenceObj.issueDateString = dateTimeFns.dateIntegerToString(licenceObj.issueDate || 0);
    licenceObj.issueTimeString = dateTimeFns.timeIntegerToString(licenceObj.issueTime || 0);
    licenceObj.locationDisplayName =
        (licenceObj.locationName === "" ? licenceObj.locationAddress1 : licenceObj.locationName);
    licenceObj.canUpdate = exports.canUpdateObject(licenceObj, reqSession);
    if (queryOptions) {
        if ("includeTicketTypes" in queryOptions && queryOptions.includeTicketTypes) {
            const ticketTypesList = db.prepare("select t.ticketType," +
                " t.distributorLocationID," +
                " d.locationName as distributorLocationName, d.locationAddress1 as distributorLocationAddress1," +
                " t.manufacturerLocationID," +
                " m.locationName as manufacturerLocationName, m.locationAddress1 as manufacturerLocationAddress1," +
                " t.unitCount, t.licenceFee" +
                " from LotteryLicenceTicketTypes t" +
                " left join Locations d on t.distributorLocationID = d.locationID" +
                " left join Locations m on t.manufacturerLocationID = m.locationID" +
                " where t.recordDelete_timeMillis is null" +
                " and t.licenceID = ?" +
                " order by t.ticketType")
                .all(licenceID);
            for (const ticketTypeObj of ticketTypesList) {
                ticketTypeObj.distributorLocationDisplayName = ticketTypeObj.distributorLocationName === ""
                    ? ticketTypeObj.distributorLocationAddress1
                    : ticketTypeObj.distributorLocationName;
                ticketTypeObj.manufacturerLocationDisplayName = ticketTypeObj.manufacturerLocationName === ""
                    ? ticketTypeObj.manufacturerLocationAddress1
                    : ticketTypeObj.manufacturerLocationName;
            }
            licenceObj.licenceTicketTypes = ticketTypesList;
        }
        if ("includeFields" in queryOptions && queryOptions.includeFields) {
            const fieldList = db.prepare("select * from LotteryLicenceFields" +
                " where licenceID = ?")
                .all(licenceID);
            licenceObj.licenceFields = fieldList;
        }
        if ("includeEvents" in queryOptions && queryOptions.includeEvents) {
            const eventList = db.prepare("select eventDate," +
                " costs_receipts, costs_admin, costs_prizesAwarded," +
                " costs_amountDonated" +
                " from LotteryEvents" +
                " where licenceID = ?" +
                " and recordDelete_timeMillis is null" +
                " order by eventDate")
                .all(licenceID);
            for (const eventObj of eventList) {
                eventObj.eventDateString = dateTimeFns.dateIntegerToString(eventObj.eventDate);
                eventObj.costs_netProceeds = (eventObj.costs_receipts || 0) -
                    (eventObj.costs_admin || 0) -
                    (eventObj.costs_prizesAwarded || 0);
            }
            licenceObj.events = eventList;
        }
        if ("includeAmendments" in queryOptions && queryOptions.includeAmendments) {
            const amendments = db.prepare("select *" +
                " from LotteryLicenceAmendments" +
                " where licenceID = ?" +
                " and recordDelete_timeMillis is null" +
                " order by amendmentDate, amendmentTime, amendmentIndex")
                .all(licenceID);
            for (const amendmentObj of amendments) {
                amendmentObj.amendmentDateString = dateTimeFns.dateIntegerToString(amendmentObj.amendmentDate);
                amendmentObj.amendmentTimeString = dateTimeFns.timeIntegerToString(amendmentObj.amendmentTime);
            }
            licenceObj.licenceAmendments = amendments;
        }
        if ("includeTransactions" in queryOptions && queryOptions.includeTransactions) {
            const transactions = db.prepare("select * from LotteryLicenceTransactions" +
                " where licenceID = ?" +
                " and recordDelete_timeMillis is null" +
                " order by transactionDate, transactionTime, transactionIndex")
                .all(licenceID);
            let licenceTransactionTotal = 0;
            for (const transactionObj of transactions) {
                transactionObj.transactionDateString = dateTimeFns.dateIntegerToString(transactionObj.transactionDate);
                transactionObj.transactionTimeString = dateTimeFns.timeIntegerToString(transactionObj.transactionTime);
                licenceTransactionTotal += transactionObj.transactionAmount;
            }
            licenceObj.licenceTransactions = transactions;
            licenceObj.licenceTransactionTotal = licenceTransactionTotal;
        }
    }
    return licenceObj;
};
const addLicenceAmendmentWithDB = (db, licenceID, amendmentType, amendment, isHidden, reqSession) => {
    const amendmentIndexRecord = db.prepare("select amendmentIndex" +
        " from LotteryLicenceAmendments" +
        " where licenceID = ?" +
        " order by amendmentIndex desc" +
        " limit 1")
        .get(licenceID);
    const amendmentIndex = (amendmentIndexRecord ? amendmentIndexRecord.amendmentIndex : 0) + 1;
    const nowDate = new Date();
    const amendmentDate = dateTimeFns.dateToInteger(nowDate);
    const amendmentTime = dateTimeFns.dateToTimeInteger(nowDate);
    db.prepare("insert into LotteryLicenceAmendments" +
        " (licenceID, amendmentIndex, amendmentDate, amendmentTime, amendmentType, amendment, isHidden," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(licenceID, amendmentIndex, amendmentDate, amendmentTime, amendmentType, amendment, isHidden, reqSession.user.userName, nowDate.getTime(), reqSession.user.userName, nowDate.getTime());
    return amendmentIndex;
};
exports.getRawRowsColumns = (sql, params) => {
    const db = sqlite(exports.dbPath, {
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
let eventTableStats = {
    eventYearMin: 1970
};
let eventTableStatsExpiryMillis = -1;
exports.getLicenceTableStats = () => {
    if (Date.now() < licenceTableStatsExpiryMillis) {
        return licenceTableStats;
    }
    const db = sqlite(exports.dbPath, {
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
exports.getLicences = (reqBodyOrParamsObj, reqSession, includeOptions) => {
    if (reqBodyOrParamsObj.organizationName && reqBodyOrParamsObj.organizationName !== "") {
        includeOptions.includeOrganization = true;
    }
    const db = sqlite(exports.dbPath, {
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
    let count = 0;
    if (includeOptions.limit !== -1) {
        count = db.prepare("select ifnull(count(*), 0) as cnt" +
            " from LotteryLicences l" +
            " left join Organizations o on l.organizationID = o.organizationID" +
            sqlWhereClause)
            .get(sqlParams)
            .cnt;
    }
    let sql = "select l.licenceID, l.organizationID," +
        (includeOptions.includeOrganization
            ? " o.organizationName,"
            : "") +
        " l.applicationDate, l.licenceTypeKey," +
        " l.startDate, l.startTime, l.endDate, l.endTime," +
        " l.locationID, lo.locationName, lo.locationAddress1," +
        " l.municipality, l.licenceDetails, l.termsConditions," +
        " l.externalLicenceNumber, l.issueDate," +
        " l.recordCreate_userName, l.recordCreate_timeMillis, l.recordUpdate_userName, l.recordUpdate_timeMillis" +
        " from LotteryLicences l" +
        " left join Locations lo on l.locationID = lo.locationID" +
        (includeOptions.includeOrganization
            ? " left join Organizations o on l.organizationID = o.organizationID"
            : "") +
        sqlWhereClause +
        " order by l.endDate desc, l.startDate desc, l.licenceID";
    if (includeOptions.limit !== -1) {
        sql += " limit " + includeOptions.limit.toString() +
            " offset " + includeOptions.offset.toString();
    }
    const rows = db.prepare(sql)
        .all(sqlParams);
    db.close();
    for (const ele of rows) {
        ele.recordType = "licence";
        ele.applicationDateString = dateTimeFns.dateIntegerToString(ele.applicationDate || 0);
        ele.startDateString = dateTimeFns.dateIntegerToString(ele.startDate || 0);
        ele.endDateString = dateTimeFns.dateIntegerToString(ele.endDate || 0);
        ele.startTimeString = dateTimeFns.timeIntegerToString(ele.startTime || 0);
        ele.endTimeString = dateTimeFns.timeIntegerToString(ele.endTime || 0);
        ele.issueDateString = dateTimeFns.dateIntegerToString(ele.issueDate || 0);
        ele.locationDisplayName =
            (ele.locationName === "" ? ele.locationAddress1 : ele.locationName);
        ele.canUpdate = exports.canUpdateObject(ele, reqSession);
    }
    return {
        count: (includeOptions.limit === -1 ? rows.length : count),
        licences: rows
    };
};
exports.getLicence = (licenceID, reqSession) => {
    const db = sqlite(exports.dbPath, {
        readonly: true
    });
    const licenceObj = getLicenceWithDB(db, licenceID, reqSession, {
        includeTicketTypes: true,
        includeFields: true,
        includeEvents: true,
        includeAmendments: true,
        includeTransactions: true
    });
    db.close();
    return licenceObj;
};
exports.getNextExternalLicenceNumberFromRange = () => {
    const db = sqlite(exports.dbPath, {
        readonly: true
    });
    const rangeStartFromConfig = getApplicationSettingWithDB(db, "licences.externalLicenceNumber.range.start");
    const rangeStart = (rangeStartFromConfig === "" ? -1 : parseInt(rangeStartFromConfig, 10));
    const rangeEnd = parseInt(getApplicationSettingWithDB(db, "licences.externalLicenceNumber.range.end") || "0", 10);
    const row = db.prepare("select max(externalLicenceNumberInteger) as maxExternalLicenceNumberInteger" +
        " from LotteryLicences" +
        " where externalLicenceNumberInteger >= ?" +
        " and externalLicenceNumberInteger <= ?")
        .get(rangeStart, rangeEnd);
    db.close();
    if (!row) {
        return rangeStart;
    }
    const maxExternalLicenceNumber = row.maxExternalLicenceNumberInteger;
    if (!maxExternalLicenceNumber) {
        return rangeStart;
    }
    const newExternalLicenceNumber = maxExternalLicenceNumber + 1;
    if (newExternalLicenceNumber > rangeEnd) {
        return -1;
    }
    return newExternalLicenceNumber;
};
exports.createLicence = (reqBody, reqSession) => {
    const db = sqlite(exports.dbPath);
    const nowMillis = Date.now();
    let externalLicenceNumberInteger = -1;
    try {
        externalLicenceNumberInteger = parseInt(reqBody.externalLicenceNumber, 10);
    }
    catch (e) {
        externalLicenceNumberInteger = -1;
    }
    const info = db.prepare("insert into LotteryLicences (" +
        "organizationID, applicationDate, licenceTypeKey," +
        " startDate, endDate, startTime, endTime," +
        " locationID, municipality, licenceDetails, termsConditions, totalPrizeValue," +
        " externalLicenceNumber, externalLicenceNumberInteger," +
        " recordCreate_userName, recordCreate_timeMillis," +
        " recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(reqBody.organizationID, dateTimeFns.dateStringToInteger(reqBody.applicationDateString), reqBody.licenceTypeKey, dateTimeFns.dateStringToInteger(reqBody.startDateString), dateTimeFns.dateStringToInteger(reqBody.endDateString), dateTimeFns.timeStringToInteger(reqBody.startTimeString), dateTimeFns.timeStringToInteger(reqBody.endTimeString), (reqBody.locationID === "" ? null : reqBody.locationID), reqBody.municipality, reqBody.licenceDetails, reqBody.termsConditions, reqBody.totalPrizeValue, reqBody.externalLicenceNumber, externalLicenceNumberInteger, reqSession.user.userName, nowMillis, reqSession.user.userName, nowMillis);
    const licenceID = Number(info.lastInsertRowid);
    const fieldKeys = reqBody.fieldKeys.substring(1).split(",");
    for (const fieldKey of fieldKeys) {
        const fieldValue = reqBody[fieldKey];
        if (fieldKey === "" || fieldValue === "") {
            continue;
        }
        db.prepare("insert into LotteryLicenceFields" +
            " (licenceID, fieldKey, fieldValue)" +
            " values (?, ?, ?)")
            .run(licenceID, fieldKey, fieldValue);
    }
    if (reqBody.ticketType_ticketType.constructor === String) {
        db.prepare("insert into LotteryLicenceTicketTypes (" +
            "licenceID, ticketType," +
            " distributorLocationID, manufacturerLocationID," +
            " unitCount, licenceFee," +
            " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
            " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
            .run(licenceID, reqBody.ticketType_ticketType, (reqBody.ticketType_distributorLocationID === "" ? null : reqBody.ticketType_distributorLocationID), (reqBody.ticketType_manufacturerLocationID === "" ? null : reqBody.ticketType_manufacturerLocationID), reqBody.ticketType_unitCount, reqBody.ticketType_licenceFee, reqSession.user.userName, nowMillis, reqSession.user.userName, nowMillis);
    }
    else if (reqBody.ticketType_ticketType.constructor === Array) {
        reqBody.ticketType_ticketType.forEach((ticketType, ticketTypeIndex) => {
            db.prepare("insert into LotteryLicenceTicketTypes (" +
                "licenceID, ticketType," +
                " distributorLocationID, manufacturerLocationID," +
                " unitCount, licenceFee," +
                " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
                " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
                .run(licenceID, ticketType, (reqBody.ticketType_distributorLocationID[ticketTypeIndex] === ""
                ? null
                : reqBody.ticketType_distributorLocationID[ticketTypeIndex]), (reqBody.ticketType_manufacturerLocationID[ticketTypeIndex] === ""
                ? null
                : reqBody.ticketType_manufacturerLocationID[ticketTypeIndex]), reqBody.ticketType_unitCount[ticketTypeIndex], reqBody.ticketType_licenceFee[ticketTypeIndex], reqSession.user.userName, nowMillis, reqSession.user.userName, nowMillis);
        });
    }
    if (typeof (reqBody.eventDate) === "string") {
        db.prepare("insert into LotteryEvents (" +
            "licenceID, eventDate," +
            " recordCreate_userName, recordCreate_timeMillis," +
            " recordUpdate_userName, recordUpdate_timeMillis)" +
            " values (?, ?, ?, ?, ?, ?)")
            .run(licenceID, dateTimeFns.dateStringToInteger(reqBody.eventDate), reqSession.user.userName, nowMillis, reqSession.user.userName, nowMillis);
    }
    else if (typeof (reqBody.eventDate) === "object") {
        for (const eventDate of reqBody.eventDate) {
            db.prepare("insert or ignore into LotteryEvents (" +
                "licenceID, eventDate," +
                " recordCreate_userName, recordCreate_timeMillis," +
                " recordUpdate_userName, recordUpdate_timeMillis)" +
                " values (?, ?, ?, ?, ?, ?)")
                .run(licenceID, dateTimeFns.dateStringToInteger(eventDate), reqSession.user.userName, nowMillis, reqSession.user.userName, nowMillis);
        }
    }
    const licenceObj = getLicenceWithDB(db, licenceID, reqSession, {
        includeTicketTypes: true,
        includeFields: true,
        includeEvents: true,
        includeAmendments: true,
        includeTransactions: true
    });
    const feeCalculation = configFns.getProperty("licences.feeCalculationFn")(licenceObj);
    db.prepare("update LotteryLicences" +
        " set licenceFee = ?" +
        " where licenceID = ?")
        .run(feeCalculation.fee, licenceID);
    db.close();
    licenceTableStatsExpiryMillis = -1;
    return licenceID;
};
exports.updateLicence = (reqBody, reqSession) => {
    const db = sqlite(exports.dbPath);
    const pastLicenceObj = getLicenceWithDB(db, reqBody.licenceID, reqSession, {
        includeTicketTypes: true,
        includeFields: true,
        includeEvents: true,
        includeAmendments: false,
        includeTransactions: true
    });
    if (!pastLicenceObj.canUpdate) {
        db.close();
        return false;
    }
    const nowMillis = Date.now();
    let externalLicenceNumberInteger = -1;
    try {
        externalLicenceNumberInteger = parseInt(reqBody.externalLicenceNumber, 10);
    }
    catch (e) {
        externalLicenceNumberInteger = -1;
    }
    const startDate_now = dateTimeFns.dateStringToInteger(reqBody.startDateString);
    const endDate_now = dateTimeFns.dateStringToInteger(reqBody.endDateString);
    const startTime_now = dateTimeFns.timeStringToInteger(reqBody.startTimeString);
    const endTime_now = dateTimeFns.timeStringToInteger(reqBody.endTimeString);
    const info = db.prepare("update LotteryLicences" +
        " set organizationID = ?," +
        " applicationDate = ?," +
        " licenceTypeKey = ?," +
        " startDate = ?," +
        " endDate = ?," +
        " startTime = ?," +
        " endTime = ?," +
        " locationID = ?," +
        " municipality = ?," +
        " licenceDetails = ?," +
        " termsConditions = ?," +
        " totalPrizeValue = ?," +
        " licenceFee = ?," +
        " externalLicenceNumber = ?," +
        " externalLicenceNumberInteger = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where licenceID = ?" +
        " and recordDelete_timeMillis is null")
        .run(reqBody.organizationID, dateTimeFns.dateStringToInteger(reqBody.applicationDateString), reqBody.licenceTypeKey, startDate_now, endDate_now, startTime_now, endTime_now, (reqBody.locationID === "" ? null : reqBody.locationID), reqBody.municipality, reqBody.licenceDetails, reqBody.termsConditions, reqBody.totalPrizeValue, reqBody.licenceFee, reqBody.externalLicenceNumber, externalLicenceNumberInteger, reqSession.user.userName, nowMillis, reqBody.licenceID);
    const changeCount = info.changes;
    if (!changeCount) {
        db.close();
        return false;
    }
    if (pastLicenceObj.trackUpdatesAsAmendments) {
        if (configFns.getProperty("amendments.trackDateTimeUpdate") &&
            (pastLicenceObj.startDate !== startDate_now ||
                pastLicenceObj.endDate !== endDate_now ||
                pastLicenceObj.startTime !== startTime_now ||
                pastLicenceObj.endTime !== endTime_now)) {
            const amendment = ((pastLicenceObj.startDate !== startDate_now
                ? `Start Date: ${pastLicenceObj.startDate.toString()} -> ${startDate_now.toString()}` + "\n"
                : "") +
                (pastLicenceObj.endDate !== endDate_now
                    ? `End Date: ${pastLicenceObj.endDate.toString()} -> ${endDate_now.toString()}` + "\n"
                    : "") +
                (pastLicenceObj.startTime !== startTime_now
                    ? `Start Time: ${pastLicenceObj.startTime.toString()} -> ${startTime_now.toString()}` + "\n"
                    : "") +
                (pastLicenceObj.endTime !== endTime_now
                    ? `End Time: ${pastLicenceObj.endTime.toString()} -> ${endTime_now.toString()}` + "\n"
                    : "")).trim();
            addLicenceAmendmentWithDB(db, reqBody.licenceID, "Date Update", amendment, 0, reqSession);
        }
        if (pastLicenceObj.organizationID !== parseInt(reqBody.organizationID, 10) &&
            configFns.getProperty("amendments.trackOrganizationUpdate")) {
            addLicenceAmendmentWithDB(db, reqBody.licenceID, "Organization Change", "", 0, reqSession);
        }
        if (pastLicenceObj.locationID !== parseInt(reqBody.locationID, 10) &&
            configFns.getProperty("amendments.trackLocationUpdate")) {
            addLicenceAmendmentWithDB(db, reqBody.licenceID, "Location Change", "", 0, reqSession);
        }
        if (pastLicenceObj.licenceFee !== parseFloat(reqBody.licenceFee) &&
            configFns.getProperty("amendments.trackLicenceFeeUpdate")) {
            addLicenceAmendmentWithDB(db, reqBody.licenceID, "Licence Fee Change", "$" + pastLicenceObj.licenceFee.toFixed(2) + " -> $" + parseFloat(reqBody.licenceFee).toFixed(2), 0, reqSession);
        }
    }
    db.prepare("delete from LotteryLicenceFields" +
        " where licenceID = ?")
        .run(reqBody.licenceID);
    const fieldKeys = reqBody.fieldKeys.substring(1).split(",");
    for (const fieldKey of fieldKeys) {
        const fieldValue = reqBody[fieldKey];
        if (fieldKey === "" || fieldValue === "") {
            continue;
        }
        db.prepare("insert into LotteryLicenceFields" +
            " (licenceID, fieldKey, fieldValue)" +
            " values (?, ?, ?)")
            .run(reqBody.licenceID, fieldKey, fieldValue);
    }
    if (typeof (reqBody.ticketType_toDelete) === "string") {
        db.prepare("update LotteryLicenceTicketTypes" +
            " set recordDelete_userName = ?," +
            " recordDelete_timeMillis = ?" +
            " where licenceID = ?" +
            " and ticketType = ?")
            .run(reqSession.user.userName, nowMillis, reqBody.licenceID, reqBody.ticketType_toDelete);
        if (pastLicenceObj.trackUpdatesAsAmendments &&
            configFns.getProperty("amendments.trackTicketTypeDelete")) {
            addLicenceAmendmentWithDB(db, reqBody.licenceID, "Ticket Type Removed", "Removed " + reqBody.ticketType_toDelete + ".", 0, reqSession);
        }
    }
    else if (typeof (reqBody.ticketType_toDelete) === "object") {
        for (const ticketType of reqBody.ticketType_toDelete) {
            db.prepare("update LotteryLicenceTicketTypes" +
                " set recordDelete_userName = ?," +
                " recordDelete_timeMillis = ?" +
                " where licenceID = ?" +
                " and ticketType = ?")
                .run(reqSession.user.userName, nowMillis, reqBody.licenceID, ticketType);
            if (pastLicenceObj.trackUpdatesAsAmendments &&
                configFns.getProperty("amendments.trackTicketTypeDelete")) {
                addLicenceAmendmentWithDB(db, reqBody.licenceID, "Ticket Type Removed", "Removed " + ticketType + ".", 0, reqSession);
            }
        }
    }
    if (typeof (reqBody.ticketType_toAdd) === "string") {
        const addInfo = db
            .prepare("update LotteryLicenceTicketTypes" +
            " set costs_receipts = null," +
            " costs_admin = null," +
            " costs_prizesAwarded = null," +
            " recordDelete_userName = null," +
            " recordDelete_timeMillis = null," +
            " recordUpdate_userName = ?," +
            " recordUpdate_timeMillis = ?" +
            " where licenceID = ?" +
            " and ticketType = ?" +
            " and recordDelete_timeMillis is not null")
            .run(reqSession.user.userName, nowMillis, reqBody.licenceID, reqBody.ticketType_toAdd);
        if (addInfo.changes === 0) {
            db.prepare("insert or ignore into LotteryLicenceTicketTypes" +
                " (licenceID, ticketType, unitCount," +
                " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
                " values (?, ?, ?, ?, ?, ?, ?)")
                .run(reqBody.licenceID, reqBody.ticketType_toAdd, 0, reqSession.user.userName, nowMillis, reqSession.user.userName, nowMillis);
        }
        if (pastLicenceObj.trackUpdatesAsAmendments &&
            configFns.getProperty("amendments.trackTicketTypeNew")) {
            addLicenceAmendmentWithDB(db, reqBody.licenceID, "New Ticket Type", "Added " + reqBody.ticketType_toAdd + ".", 0, reqSession);
        }
    }
    else if (typeof (reqBody.ticketType_toAdd) === "object") {
        for (const ticketType of reqBody.ticketType_toAdd) {
            const addInfo = db.prepare("update LotteryLicenceTicketTypes" +
                " set costs_receipts = null," +
                " costs_admin = null," +
                " costs_prizesAwarded = null," +
                " recordDelete_userName = null," +
                " recordDelete_timeMillis = null," +
                " recordUpdate_userName = ?," +
                " recordUpdate_timeMillis = ?" +
                " where licenceID = ?" +
                " and ticketType = ?" +
                " and recordDelete_timeMillis is not null")
                .run(reqSession.user.userName, nowMillis, reqBody.licenceID, ticketType);
            if (addInfo.changes === 0) {
                db.prepare("insert or ignore into LotteryLicenceTicketTypes" +
                    " (licenceID, ticketType, unitCount," +
                    " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
                    " values (?, ?, ?, ?, ?, ?, ?)")
                    .run(reqBody.licenceID, ticketType, 0, reqSession.user.userName, nowMillis, reqSession.user.userName, nowMillis);
            }
            if (pastLicenceObj.trackUpdatesAsAmendments &&
                configFns.getProperty("amendments.trackTicketTypeNew")) {
                addLicenceAmendmentWithDB(db, reqBody.licenceID, "New Ticket Type", "Added " + ticketType + ".", 0, reqSession);
            }
        }
    }
    if (reqBody.ticketType_ticketType.constructor === String) {
        db.prepare("update LotteryLicenceTicketTypes" +
            " set distributorLocationID = ?," +
            " manufacturerLocationID = ?," +
            " unitCount = ?," +
            " licenceFee = ?," +
            " recordUpdate_userName = ?," +
            " recordUpdate_timeMillis = ?" +
            " where licenceID = ?" +
            " and ticketType = ?" +
            " and recordDelete_timeMillis is null")
            .run((reqBody.ticketType_distributorLocationID === "" ? null : reqBody.ticketType_distributorLocationID), (reqBody.ticketType_manufacturerLocationID === "" ? null : reqBody.ticketType_manufacturerLocationID), reqBody.ticketType_unitCount, reqBody.ticketType_licenceFee, reqSession.user.userName, nowMillis, reqBody.licenceID, reqBody.ticketType_ticketType);
        if (pastLicenceObj.trackUpdatesAsAmendments) {
            const ticketTypeObj_past = pastLicenceObj.licenceTicketTypes
                .find((ele) => ele.ticketType === reqBody.ticketType_ticketType);
            if (ticketTypeObj_past &&
                configFns.getProperty("amendments.trackTicketTypeUpdate") &&
                ticketTypeObj_past.unitCount !== parseInt(reqBody.ticketType_unitCount, 10)) {
                addLicenceAmendmentWithDB(db, reqBody.licenceID, "Ticket Type Change", (reqBody.ticketType_ticketType + " Units: " +
                    ticketTypeObj_past.unitCount.toString() + " -> " + reqBody.ticketType_unitCount.toString()), 0, reqSession);
            }
        }
    }
    else if (reqBody.ticketType_ticketType.constructor === Array) {
        reqBody.ticketType_ticketType.forEach((ticketType, ticketTypeIndex) => {
            db.prepare("update LotteryLicenceTicketTypes" +
                " set distributorLocationID = ?," +
                " manufacturerLocationID = ?," +
                " unitCount = ?," +
                " licenceFee = ?," +
                " recordUpdate_userName = ?," +
                " recordUpdate_timeMillis = ?" +
                " where licenceID = ?" +
                " and ticketType = ?" +
                " and recordDelete_timeMillis is null")
                .run((reqBody.ticketType_distributorLocationID[ticketTypeIndex] === ""
                ? null
                : reqBody.ticketType_distributorLocationID[ticketTypeIndex]), (reqBody.ticketType_manufacturerLocationID[ticketTypeIndex] === ""
                ? null
                : reqBody.ticketType_manufacturerLocationID[ticketTypeIndex]), reqBody.ticketType_unitCount[ticketTypeIndex], reqBody.ticketType_licenceFee[ticketTypeIndex], reqSession.user.userName, nowMillis, reqBody.licenceID, ticketType);
            if (pastLicenceObj.trackUpdatesAsAmendments) {
                const ticketTypeObj_past = pastLicenceObj.licenceTicketTypes.find((ele) => ele.ticketType === ticketType);
                if (ticketTypeObj_past &&
                    configFns.getProperty("amendments.trackTicketTypeUpdate") &&
                    ticketTypeObj_past.unitCount !== parseInt(reqBody.ticketType_unitCount[ticketTypeIndex], 10)) {
                    addLicenceAmendmentWithDB(db, reqBody.licenceID, "Ticket Type Change", (ticketType + " Units: " +
                        ticketTypeObj_past.unitCount.toString() + " -> " + reqBody.ticketType_unitCount[ticketTypeIndex]), 0, reqSession);
                }
            }
        });
    }
    if (typeof (reqBody.eventDate) !== "undefined") {
        db.prepare("delete from LotteryEventFields" +
            " where licenceID = ?" +
            (" and eventDate in (" +
                "select eventDate from LotteryEvents where licenceID = ? and recordDelete_timeMillis is not null" +
                ")"))
            .run(reqBody.licenceID, reqBody.licenceID);
        db.prepare("delete from LotteryEvents" +
            " where licenceID = ?" +
            " and recordDelete_timeMillis is not null")
            .run(reqBody.licenceID);
    }
    if (typeof (reqBody.eventDate) === "string") {
        db.prepare("insert or ignore into LotteryEvents (" +
            "licenceID, eventDate," +
            " recordCreate_userName, recordCreate_timeMillis," +
            " recordUpdate_userName, recordUpdate_timeMillis)" +
            " values (?, ?, ?, ?, ?, ?)")
            .run(reqBody.licenceID, dateTimeFns.dateStringToInteger(reqBody.eventDate), reqSession.user.userName, nowMillis, reqSession.user.userName, nowMillis);
    }
    else if (typeof (reqBody.eventDate) === "object") {
        for (const eventDate of reqBody.eventDate) {
            db.prepare("insert or ignore into LotteryEvents (" +
                "licenceID, eventDate," +
                " recordCreate_userName, recordCreate_timeMillis," +
                " recordUpdate_userName, recordUpdate_timeMillis)" +
                " values (?, ?, ?, ?, ?, ?)")
                .run(reqBody.licenceID, dateTimeFns.dateStringToInteger(eventDate), reqSession.user.userName, nowMillis, reqSession.user.userName, nowMillis);
        }
    }
    db.close();
    licenceTableStatsExpiryMillis = -1;
    eventTableStatsExpiryMillis = -1;
    return changeCount > 0;
};
exports.deleteLicence = (licenceID, reqSession) => {
    const db = sqlite(exports.dbPath);
    const nowMillis = Date.now();
    const info = db.prepare("update LotteryLicences" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where licenceID = ?" +
        " and recordDelete_timeMillis is null")
        .run(reqSession.user.userName, nowMillis, licenceID);
    const changeCount = info.changes;
    if (changeCount) {
        db.prepare("update LotteryEvents" +
            " set recordDelete_userName = ?," +
            " recordDelete_timeMillis = ?" +
            " where licenceID = ?" +
            " and recordDelete_timeMillis is null")
            .run(reqSession.user.userName, nowMillis, licenceID);
    }
    db.close();
    licenceTableStatsExpiryMillis = -1;
    eventTableStatsExpiryMillis = -1;
    return changeCount > 0;
};
exports.getDistinctTermsConditions = (organizationID) => {
    const db = sqlite(exports.dbPath, {
        readonly: true
    });
    const terms = db.prepare("select termsConditions," +
        " count(licenceID) as termsConditionsCount," +
        " max(startDate) as startDateMax" +
        " from LotteryLicences l" +
        " where l.organizationID = ?" +
        " and l.termsConditions is not null and trim(l.termsConditions) <> ''" +
        " and l.recordDelete_timeMillis is null" +
        " group by l.termsConditions" +
        " order by startDateMax desc")
        .all(organizationID);
    db.close();
    for (const term of terms) {
        term.startDateMaxString = dateTimeFns.dateIntegerToString(term.startDateMax);
    }
    return terms;
};
exports.pokeLicence = (licenceID, reqSession) => {
    const db = sqlite(exports.dbPath);
    const nowMillis = Date.now();
    const info = db.prepare("update LotteryLicences" +
        " set recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where licenceID = ?" +
        " and recordDelete_timeMillis is null")
        .run(reqSession.user.userName, nowMillis, licenceID);
    db.close();
    return info.changes > 0;
};
exports.issueLicence = (licenceID, reqSession) => {
    const db = sqlite(exports.dbPath);
    const nowDate = new Date();
    const issueDate = dateTimeFns.dateToInteger(nowDate);
    const issueTime = dateTimeFns.dateToTimeInteger(nowDate);
    const info = db.prepare("update LotteryLicences" +
        " set issueDate = ?," +
        " issueTime = ?," +
        " trackUpdatesAsAmendments = 1," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where licenceID = ?" +
        " and recordDelete_timeMillis is null" +
        " and issueDate is null")
        .run(issueDate, issueTime, reqSession.user.userName, nowDate.getTime(), licenceID);
    db.close();
    return info.changes > 0;
};
exports.unissueLicence = (licenceID, reqSession) => {
    const db = sqlite(exports.dbPath);
    const nowMillis = Date.now();
    const info = db.prepare("update LotteryLicences" +
        " set issueDate = null," +
        " issueTime = null," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where licenceID = ?" +
        " and recordDelete_timeMillis is null" +
        " and issueDate is not null")
        .run(reqSession.user.userName, nowMillis, licenceID);
    const changeCount = info.changes;
    if (changeCount) {
        addLicenceAmendmentWithDB(db, licenceID, "Unissue Licence", "", 1, reqSession);
    }
    db.close();
    return changeCount > 0;
};
exports.getLicenceTypeSummary = (reqBody) => {
    const db = sqlite(exports.dbPath, {
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
    const db = sqlite(exports.dbPath, {
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
exports.addTransaction = (reqBody, reqSession) => {
    const db = sqlite(exports.dbPath);
    const licenceObj = getLicenceWithDB(db, reqBody.licenceID, reqSession, {
        includeTicketTypes: false,
        includeFields: false,
        includeEvents: false,
        includeAmendments: false,
        includeTransactions: false
    });
    const row = db.prepare("select ifnull(max(transactionIndex), -1) as maxIndex" +
        " from LotteryLicenceTransactions" +
        " where licenceID = ?")
        .get(reqBody.licenceID);
    const newTransactionIndex = row.maxIndex + 1;
    const rightNow = new Date();
    const transactionDate = dateTimeFns.dateToInteger(rightNow);
    const transactionTime = dateTimeFns.dateToTimeInteger(rightNow);
    db.prepare("insert into LotteryLicenceTransactions (" +
        "licenceID, transactionIndex," +
        " transactionDate, transactionTime," +
        " externalReceiptNumber, transactionAmount, transactionNote," +
        " recordCreate_userName, recordCreate_timeMillis," +
        " recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(reqBody.licenceID, newTransactionIndex, transactionDate, transactionTime, reqBody.externalReceiptNumber, reqBody.transactionAmount, reqBody.transactionNote, reqSession.user.userName, rightNow.getTime(), reqSession.user.userName, rightNow.getTime());
    if (licenceObj.trackUpdatesAsAmendments) {
        addLicenceAmendmentWithDB(db, reqBody.licenceID, "New Transaction", "", 1, reqSession);
    }
    if (reqBody.issueLicence === "true") {
        db.prepare("update LotteryLicences" +
            " set issueDate = ?," +
            " issueTime = ?," +
            " trackUpdatesAsAmendments = 1," +
            " recordUpdate_userName = ?," +
            " recordUpdate_timeMillis = ?" +
            " where licenceID = ?" +
            " and recordDelete_timeMillis is null" +
            " and issueDate is null")
            .run(transactionDate, transactionTime, reqSession.user.userName, rightNow.getTime(), reqBody.licenceID);
    }
    db.close();
    return newTransactionIndex;
};
exports.voidTransaction = (licenceID, transactionIndex, reqSession) => {
    const db = sqlite(exports.dbPath);
    const licenceObj = getLicenceWithDB(db, licenceID, reqSession, {
        includeTicketTypes: false,
        includeFields: false,
        includeEvents: false,
        includeAmendments: false,
        includeTransactions: false
    });
    const nowMillis = Date.now();
    const info = db.prepare("update LotteryLicenceTransactions" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where licenceID = ?" +
        " and transactionIndex = ?" +
        " and recordDelete_timeMillis is null")
        .run(reqSession.user.userName, nowMillis, licenceID, transactionIndex);
    const changeCount = info.changes;
    if (changeCount && licenceObj.trackUpdatesAsAmendments) {
        addLicenceAmendmentWithDB(db, licenceID, "Transaction Voided", "", 1, reqSession);
    }
    db.close();
    return changeCount > 0;
};
exports.getEventTableStats = () => {
    if (Date.now() < eventTableStatsExpiryMillis) {
        return eventTableStats;
    }
    const db = sqlite(exports.dbPath, {
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
    const db = sqlite(exports.dbPath, {
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
    const db = sqlite(exports.dbPath, {
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
    const db = sqlite(exports.dbPath, {
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
    const db = sqlite(exports.dbPath, {
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
exports.getEvent = (licenceID, eventDate, reqSession) => {
    const db = sqlite(exports.dbPath, {
        readonly: true
    });
    const eventObj = db.prepare("select *" +
        " from LotteryEvents" +
        " where recordDelete_timeMillis is null" +
        " and licenceID = ?" +
        " and eventDate = ?")
        .get(licenceID, eventDate);
    if (eventObj) {
        eventObj.recordType = "event";
        eventObj.eventDateString = dateTimeFns.dateIntegerToString(eventObj.eventDate);
        eventObj.reportDateString = dateTimeFns.dateIntegerToString(eventObj.reportDate);
        eventObj.startTimeString = dateTimeFns.timeIntegerToString(eventObj.startTime || 0);
        eventObj.endTimeString = dateTimeFns.timeIntegerToString(eventObj.endTime || 0);
        eventObj.costs_netProceeds = (eventObj.costs_receipts || 0) -
            (eventObj.costs_admin || 0) -
            (eventObj.costs_prizesAwarded || 0);
        eventObj.canUpdate = exports.canUpdateObject(eventObj, reqSession);
        const rows = db.prepare("select fieldKey, fieldValue" +
            " from LotteryEventFields" +
            " where licenceID = ? and eventDate = ?")
            .all(licenceID, eventDate);
        eventObj.eventFields = rows || [];
    }
    db.close();
    return eventObj;
};
exports.getPastEventBankingInformation = (licenceID) => {
    const db = sqlite(exports.dbPath, {
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
    const db = sqlite(exports.dbPath);
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
    const db = sqlite(exports.dbPath);
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
exports.pokeEvent = (licenceID, eventDate, reqSession) => {
    const db = sqlite(exports.dbPath);
    const nowMillis = Date.now();
    const info = db.prepare("update LotteryEvents" +
        " set recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where licenceID = ?" +
        " and eventDate = ?" +
        " and recordDelete_timeMillis is null")
        .run(reqSession.user.userName, nowMillis, licenceID, eventDate);
    db.close();
    return info.changes > 0;
};
exports.getLicenceActivityByDateRange = (startDate, endDate, _reqBody) => {
    const db = sqlite(exports.dbPath, {
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
exports.getApplicationSettings = () => {
    const db = sqlite(exports.dbPath, {
        readonly: true
    });
    const rows = db.prepare("select * from ApplicationSettings order by orderNumber, settingKey").all();
    db.close();
    return rows;
};
exports.getApplicationSetting = (settingKey) => {
    const db = sqlite(exports.dbPath, {
        readonly: true
    });
    const settingValue = getApplicationSettingWithDB(db, settingKey);
    db.close();
    return settingValue;
};
exports.updateApplicationSetting = (settingKey, settingValue, reqSession) => {
    const db = sqlite(exports.dbPath);
    const nowMillis = Date.now();
    const info = db.prepare("update ApplicationSettings" +
        " set settingValue = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where settingKey = ?")
        .run(settingValue, reqSession.user.userName, nowMillis, settingKey);
    db.close();
    return info.changes > 0;
};
