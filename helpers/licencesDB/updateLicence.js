"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLicence = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const configFns = require("../configFns");
const getLicence_1 = require("./getLicence");
const addLicenceAmendment_1 = require("./addLicenceAmendment");
const licencesDB_1 = require("../licencesDB");
const updateLicence = (reqBody, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB);
    const pastLicenceObj = getLicence_1.getLicenceWithDB(db, reqBody.licenceID, reqSession, {
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
            addLicenceAmendment_1.addLicenceAmendmentWithDB(db, reqBody.licenceID, "Date Update", amendment, 0, reqSession);
        }
        if (pastLicenceObj.organizationID !== parseInt(reqBody.organizationID, 10) &&
            configFns.getProperty("amendments.trackOrganizationUpdate")) {
            addLicenceAmendment_1.addLicenceAmendmentWithDB(db, reqBody.licenceID, "Organization Change", "", 0, reqSession);
        }
        if (pastLicenceObj.locationID !== parseInt(reqBody.locationID, 10) &&
            configFns.getProperty("amendments.trackLocationUpdate")) {
            addLicenceAmendment_1.addLicenceAmendmentWithDB(db, reqBody.licenceID, "Location Change", "", 0, reqSession);
        }
        if (pastLicenceObj.licenceFee !== parseFloat(reqBody.licenceFee) &&
            configFns.getProperty("amendments.trackLicenceFeeUpdate")) {
            addLicenceAmendment_1.addLicenceAmendmentWithDB(db, reqBody.licenceID, "Licence Fee Change", "$" + pastLicenceObj.licenceFee.toFixed(2) + " -> $" + parseFloat(reqBody.licenceFee).toFixed(2), 0, reqSession);
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
    if (typeof (reqBody.ticketType_ticketType_toDelete) === "string") {
        db.prepare("update LotteryLicenceTicketTypes" +
            " set recordDelete_userName = ?," +
            " recordDelete_timeMillis = ?" +
            " where licenceID = ?" +
            " and eventDate = ?" +
            " and ticketType = ?")
            .run(reqSession.user.userName, nowMillis, reqBody.licenceID, dateTimeFns.dateStringToInteger(reqBody.ticketType_eventDateString_toDelete), reqBody.ticketType_ticketType_toDelete);
        if (pastLicenceObj.trackUpdatesAsAmendments &&
            configFns.getProperty("amendments.trackTicketTypeDelete")) {
            addLicenceAmendment_1.addLicenceAmendmentWithDB(db, reqBody.licenceID, "Ticket Type Removed", "Removed " + reqBody.ticketType_eventDateString_toDelete + ", " + reqBody.ticketType_ticketType_toDelete + ".", 0, reqSession);
        }
    }
    else if (typeof (reqBody.ticketType_ticketType_toDelete) === "object") {
        reqBody.ticketType_ticketType_toDelete.forEach((ticketType, ticketTypeIndex) => {
            db.prepare("update LotteryLicenceTicketTypes" +
                " set recordDelete_userName = ?," +
                " recordDelete_timeMillis = ?" +
                " where licenceID = ?" +
                " and eventDate = ?" +
                " and ticketType = ?")
                .run(reqSession.user.userName, nowMillis, reqBody.licenceID, dateTimeFns.dateStringToInteger(reqBody.ticketType_eventDateString_toDelete[ticketTypeIndex]), ticketType);
            if (pastLicenceObj.trackUpdatesAsAmendments &&
                configFns.getProperty("amendments.trackTicketTypeDelete")) {
                addLicenceAmendment_1.addLicenceAmendmentWithDB(db, reqBody.licenceID, "Ticket Type Removed", "Removed " + reqBody.ticketType_eventDateString_toDelete[ticketTypeIndex] + ", " + ticketType + ".", 0, reqSession);
            }
        });
    }
    if (typeof (reqBody.ticketType_ticketType_toAdd) === "string") {
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
            " and eventDate = ?" +
            " and ticketType = ?" +
            " and recordDelete_timeMillis is not null")
            .run(reqSession.user.userName, nowMillis, reqBody.licenceID, reqBody.ticketType_eventDateString_toAdd, reqBody.ticketType_ticketType_toAdd);
        if (addInfo.changes === 0) {
            db.prepare("insert or ignore into LotteryLicenceTicketTypes" +
                " (licenceID, eventDate, ticketType, unitCount," +
                " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
                " values (?, ?, ?, ?, ?, ?, ?, ?)")
                .run(reqBody.licenceID, reqBody.ticketType_eventDateString_toAdd, reqBody.ticketType_ticketType_toAdd, 0, reqSession.user.userName, nowMillis, reqSession.user.userName, nowMillis);
        }
        if (pastLicenceObj.trackUpdatesAsAmendments &&
            configFns.getProperty("amendments.trackTicketTypeNew")) {
            addLicenceAmendment_1.addLicenceAmendmentWithDB(db, reqBody.licenceID, "New Ticket Type", "Added " + reqBody.ticketType_eventDateString_toAdd + ", " + reqBody.ticketType_ticketType_toAdd + ".", 0, reqSession);
        }
    }
    else if (typeof (reqBody.ticketType_ticketType_toAdd) === "object") {
        reqBody.ticketType_ticketType_toAdd.forEach((ticketType, ticketTypeIndex) => {
            const addInfo = db.prepare("update LotteryLicenceTicketTypes" +
                " set costs_receipts = null," +
                " costs_admin = null," +
                " costs_prizesAwarded = null," +
                " recordDelete_userName = null," +
                " recordDelete_timeMillis = null," +
                " recordUpdate_userName = ?," +
                " recordUpdate_timeMillis = ?" +
                " where licenceID = ?" +
                " and eventDate = ?" +
                " and ticketType = ?" +
                " and recordDelete_timeMillis is not null")
                .run(reqSession.user.userName, nowMillis, reqBody.licenceID, reqBody.ticketType_eventDateString_toAdd[ticketTypeIndex], ticketType);
            if (addInfo.changes === 0) {
                db.prepare("insert or ignore into LotteryLicenceTicketTypes" +
                    " (licenceID, eventDate, ticketType, unitCount," +
                    " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
                    " values (?, ?, ?, ?, ?, ?, ?, ?)")
                    .run(reqBody.licenceID, reqBody.ticketType_eventDateString_toAdd[ticketTypeIndex], ticketType, 0, reqSession.user.userName, nowMillis, reqSession.user.userName, nowMillis);
            }
            if (pastLicenceObj.trackUpdatesAsAmendments &&
                configFns.getProperty("amendments.trackTicketTypeNew")) {
                addLicenceAmendment_1.addLicenceAmendmentWithDB(db, reqBody.licenceID, "New Ticket Type", "Added " + reqBody.ticketType_eventDateString_toAdd[ticketTypeIndex] + ", " + ticketType + ".", 0, reqSession);
            }
        });
    }
    if (typeof (reqBody.ticketType_ticketType) === "string") {
        db.prepare("update LotteryLicenceTicketTypes" +
            " set distributorLocationID = ?," +
            " manufacturerLocationID = ?," +
            " unitCount = ?," +
            " licenceFee = ?," +
            " recordUpdate_userName = ?," +
            " recordUpdate_timeMillis = ?" +
            " where licenceID = ?" +
            " and eventDate = ?" +
            " and ticketType = ?" +
            " and recordDelete_timeMillis is null")
            .run((reqBody.ticketType_distributorLocationID === "" ? null : reqBody.ticketType_distributorLocationID), (reqBody.ticketType_manufacturerLocationID === "" ? null : reqBody.ticketType_manufacturerLocationID), reqBody.ticketType_unitCount, reqBody.ticketType_licenceFee, reqSession.user.userName, nowMillis, reqBody.licenceID, reqBody.ticketType_eventDateString, reqBody.ticketType_ticketType);
        if (pastLicenceObj.trackUpdatesAsAmendments) {
            const ticketTypeObj_past = pastLicenceObj.licenceTicketTypes
                .find((ele) => ele.ticketType === reqBody.ticketType_ticketType);
            if (ticketTypeObj_past &&
                configFns.getProperty("amendments.trackTicketTypeUpdate") &&
                ticketTypeObj_past.unitCount !== parseInt(reqBody.ticketType_unitCount, 10)) {
                addLicenceAmendment_1.addLicenceAmendmentWithDB(db, reqBody.licenceID, "Ticket Type Change", (reqBody.ticketType_eventDateString + ", " + reqBody.ticketType_ticketType + " Units: " +
                    ticketTypeObj_past.unitCount.toString() + " -> " + reqBody.ticketType_unitCount.toString()), 0, reqSession);
            }
        }
    }
    else if (typeof (reqBody.ticketType_ticketType) === "object") {
        reqBody.ticketType_ticketType.forEach((ticketType, ticketTypeIndex) => {
            db.prepare("update LotteryLicenceTicketTypes" +
                " set distributorLocationID = ?," +
                " manufacturerLocationID = ?," +
                " unitCount = ?," +
                " licenceFee = ?," +
                " recordUpdate_userName = ?," +
                " recordUpdate_timeMillis = ?" +
                " where licenceID = ?" +
                " and eventDate = ?" +
                " and ticketType = ?" +
                " and recordDelete_timeMillis is null")
                .run((reqBody.ticketType_distributorLocationID[ticketTypeIndex] === ""
                ? null
                : reqBody.ticketType_distributorLocationID[ticketTypeIndex]), (reqBody.ticketType_manufacturerLocationID[ticketTypeIndex] === ""
                ? null
                : reqBody.ticketType_manufacturerLocationID[ticketTypeIndex]), reqBody.ticketType_unitCount[ticketTypeIndex], reqBody.ticketType_licenceFee[ticketTypeIndex], reqSession.user.userName, nowMillis, reqBody.licenceID, reqBody.ticketType_eventDateString[ticketTypeIndex], ticketType);
            if (pastLicenceObj.trackUpdatesAsAmendments) {
                const ticketTypeObj_past = pastLicenceObj.licenceTicketTypes.find((ele) => ele.ticketType === ticketType);
                if (ticketTypeObj_past &&
                    configFns.getProperty("amendments.trackTicketTypeUpdate") &&
                    ticketTypeObj_past.unitCount !== parseInt(reqBody.ticketType_unitCount[ticketTypeIndex], 10)) {
                    addLicenceAmendment_1.addLicenceAmendmentWithDB(db, reqBody.licenceID, "Ticket Type Change", (reqBody.ticketType_eventDateString[ticketTypeIndex] + ", " + ticketType + " Units: " +
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
    licencesDB_1.resetLicenceTableStats();
    licencesDB_1.resetEventTableStats();
    return changeCount > 0;
};
exports.updateLicence = updateLicence;
