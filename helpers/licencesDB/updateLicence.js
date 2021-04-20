import sqlite from "better-sqlite3";
import { licencesDB as dbPath } from "../../data/databasePaths.js";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import * as configFns from "../configFns.js";
import { getLicenceWithDB } from "./getLicence.js";
import { addLicenceAmendmentWithDB } from "./addLicenceAmendment.js";
import { createEventWithDB } from "./createEvent.js";
import { deleteLicenceTicketTypeWithDB } from "./deleteLicenceTicketType.js";
import { getMaxLicenceTicketTypeIndexWithDB } from "./getMaxLicenceTicketTypeIndex.js";
import { addLicenceTicketTypeWithDB } from "./addLicenceTicketType.js";
import { resetLicenceTableStats, resetEventTableStats } from "../licencesDB.js";
export const parseTicketTypeKey = (unparsedTicketTypeKey) => {
    const eventDateString = unparsedTicketTypeKey.substring(0, 10);
    return {
        eventDate: dateTimeFns.dateStringToInteger(eventDateString),
        eventDateString,
        ticketType: unparsedTicketTypeKey.substring(11)
    };
};
;
export const updateLicence = (reqBody, reqSession) => {
    const db = sqlite(dbPath);
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
    const nowDate = new Date();
    const nowDateInt = dateTimeFns.dateToInteger(nowDate);
    const nowMillis = nowDate.getTime();
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
    if (typeof (reqBody.eventDateString) !== "undefined") {
        db.prepare("delete from LotteryEventFields" +
            " where licenceID = ?" +
            (" and eventDate in (" +
                "select eventDate from LotteryEvents where licenceID = ? and recordDelete_timeMillis is not null" +
                ")"))
            .run(reqBody.licenceID, reqBody.licenceID);
        db.prepare("delete from LotteryEventCosts" +
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
    let eventDateStrings_toAdd;
    if (typeof (reqBody.eventDateString) === "string") {
        eventDateStrings_toAdd = [reqBody.eventDateString];
    }
    else if (typeof (reqBody.eventDateString) === "object") {
        eventDateStrings_toAdd = reqBody.eventDateString;
    }
    if (eventDateStrings_toAdd) {
        for (const eventDate of eventDateStrings_toAdd) {
            createEventWithDB(db, reqBody.licenceID, eventDate, reqSession);
        }
    }
    let ticketTypeIndexes_toDelete;
    if (typeof (reqBody.ticketTypeIndex_toDelete) === "string") {
        ticketTypeIndexes_toDelete = [reqBody.ticketTypeIndex_toDelete];
    }
    else if (typeof (reqBody.ticketTypeIndex_toDelete) === "object") {
        ticketTypeIndexes_toDelete = reqBody.ticketTypeIndex_toDelete;
    }
    if (ticketTypeIndexes_toDelete) {
        ticketTypeIndexes_toDelete.forEach((ticketTypeIndex_toDelete) => {
            deleteLicenceTicketTypeWithDB(db, {
                licenceID: reqBody.licenceID,
                ticketTypeIndex: ticketTypeIndex_toDelete
            }, reqSession);
            if (pastLicenceObj.trackUpdatesAsAmendments &&
                configFns.getProperty("amendments.trackTicketTypeDelete")) {
                addLicenceAmendmentWithDB(db, reqBody.licenceID, "Ticket Type Removed", "Removed " + ticketTypeIndex_toDelete + ".", 0, reqSession);
            }
        });
    }
    if (typeof (reqBody.ticketType_ticketType) === "string") {
        const newTicketTypeIndex = getMaxLicenceTicketTypeIndexWithDB(db, reqBody.licenceID) + 1;
        addLicenceTicketTypeWithDB(db, {
            licenceID: reqBody.licenceID,
            ticketTypeIndex: newTicketTypeIndex,
            amendmentDate: nowDateInt,
            ticketType: reqBody.ticketType_ticketType,
            unitCount: reqBody.ticketType_unitCount,
            licenceFee: reqBody.ticketType_licenceFee,
            distributorLocationID: reqBody.ticketType_distributorLocationID,
            manufacturerLocationID: reqBody.ticketType_manufacturerLocationID
        }, reqSession);
        if (pastLicenceObj.trackUpdatesAsAmendments &&
            configFns.getProperty("amendments.trackTicketTypeNew")) {
            addLicenceAmendmentWithDB(db, reqBody.licenceID, "Added Ticket Type", reqBody.ticketType_ticketType, 0, reqSession);
        }
    }
    else if (typeof (reqBody.ticketType_ticketType) === "object") {
        const newTicketTypeIndex = getMaxLicenceTicketTypeIndexWithDB(db, reqBody.licenceID) + 1;
        reqBody.ticketType_ticketType.forEach((ticketType, ticketTypeIndex) => {
            addLicenceTicketTypeWithDB(db, {
                licenceID: reqBody.licenceID,
                ticketTypeIndex: newTicketTypeIndex + ticketTypeIndex,
                amendmentDate: nowDateInt,
                ticketType,
                unitCount: reqBody.ticketType_unitCount[ticketTypeIndex],
                licenceFee: reqBody.ticketType_licenceFee[ticketTypeIndex],
                distributorLocationID: reqBody.ticketType_distributorLocationID[ticketTypeIndex],
                manufacturerLocationID: reqBody.ticketType_manufacturerLocationID[ticketTypeIndex]
            }, reqSession);
            if (pastLicenceObj.trackUpdatesAsAmendments &&
                configFns.getProperty("amendments.trackTicketTypeNew")) {
                addLicenceAmendmentWithDB(db, reqBody.licenceID, "Added Ticket Type", ticketType, 0, reqSession);
            }
        });
    }
    db.close();
    resetLicenceTableStats();
    resetEventTableStats();
    return changeCount > 0;
};
export default updateLicence;
