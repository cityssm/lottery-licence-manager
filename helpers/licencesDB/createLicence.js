import sqlite from "better-sqlite3";
import { licencesDB as dbPath } from "../../data/databasePaths.js";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import * as configFns from "../configFns.js";
import { getLicenceWithDB } from "./getLicence.js";
import { createEventWithDB } from "./createEvent.js";
import { resetLicenceTableStats, resetEventTableStats } from "../licencesDB.js";
export const createLicence = (reqBody, reqSession) => {
    const db = sqlite(dbPath);
    const nowDate = new Date();
    const nowMillis = nowDate.getTime();
    const nowDateInt = dateTimeFns.dateToInteger(nowDate);
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
    let eventDateStrings_toAdd;
    if (typeof (reqBody.eventDateString) === "string") {
        eventDateStrings_toAdd = [reqBody.eventDateString];
    }
    else if (typeof (reqBody.eventDateString) === "object") {
        eventDateStrings_toAdd = reqBody.eventDateString;
    }
    if (eventDateStrings_toAdd) {
        for (const eventDate of eventDateStrings_toAdd) {
            createEventWithDB(db, licenceID, eventDate, reqSession);
        }
    }
    if (typeof (reqBody.ticketType_ticketType) === "string") {
        db.prepare("insert into LotteryLicenceTicketTypes (" +
            "licenceID, ticketTypeIndex," +
            " amendmentDate," +
            " ticketType," +
            " distributorLocationID, manufacturerLocationID," +
            " unitCount, licenceFee," +
            " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
            " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
            .run(licenceID, 0, nowDateInt, reqBody.ticketType_ticketType, (reqBody.ticketType_distributorLocationID === "" ? null : reqBody.ticketType_distributorLocationID), (reqBody.ticketType_manufacturerLocationID === "" ? null : reqBody.ticketType_manufacturerLocationID), reqBody.ticketType_unitCount, reqBody.ticketType_licenceFee, reqSession.user.userName, nowMillis, reqSession.user.userName, nowMillis);
    }
    else if (typeof (reqBody.ticketType_ticketType) === "object") {
        reqBody.ticketType_ticketType.forEach((ticketType, ticketTypeIndex) => {
            db.prepare("insert into LotteryLicenceTicketTypes (" +
                "licenceID, ticketTypeIndex," +
                " amendmentDate," +
                " ticketType," +
                " distributorLocationID, manufacturerLocationID," +
                " unitCount, licenceFee," +
                " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
                " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
                .run(licenceID, ticketTypeIndex, nowDateInt, ticketType, (reqBody.ticketType_distributorLocationID[ticketTypeIndex] === ""
                ? null
                : reqBody.ticketType_distributorLocationID[ticketTypeIndex]), (reqBody.ticketType_manufacturerLocationID[ticketTypeIndex] === ""
                ? null
                : reqBody.ticketType_manufacturerLocationID[ticketTypeIndex]), reqBody.ticketType_unitCount[ticketTypeIndex], reqBody.ticketType_licenceFee[ticketTypeIndex], reqSession.user.userName, nowMillis, reqSession.user.userName, nowMillis);
        });
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
    resetLicenceTableStats();
    resetEventTableStats();
    return licenceID;
};
