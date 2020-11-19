"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLicence = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_2 = require("../../data/databasePaths");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const configFns = require("../configFns");
const getLicence_1 = require("./getLicence");
const licencesDB_1 = require("../licencesDB");
exports.createLicence = (reqBody, reqSession) => {
    const db = sqlite(databasePaths_2.licencesDB);
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
    if (typeof (reqBody.ticketType_ticketType) === "string") {
        db.prepare("insert into LotteryLicenceTicketTypes (" +
            "licenceID, ticketType," +
            " distributorLocationID, manufacturerLocationID," +
            " unitCount, licenceFee," +
            " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
            " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
            .run(licenceID, reqBody.ticketType_ticketType, (reqBody.ticketType_distributorLocationID === "" ? null : reqBody.ticketType_distributorLocationID), (reqBody.ticketType_manufacturerLocationID === "" ? null : reqBody.ticketType_manufacturerLocationID), reqBody.ticketType_unitCount, reqBody.ticketType_licenceFee, reqSession.user.userName, nowMillis, reqSession.user.userName, nowMillis);
    }
    else if (typeof (reqBody.ticketType_ticketType) === "object") {
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
    const licenceObj = getLicence_1.getLicenceWithDB(db, licenceID, reqSession, {
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
    licencesDB_1.resetLicenceTableStats();
    licencesDB_1.resetEventTableStats();
    return licenceID;
};
