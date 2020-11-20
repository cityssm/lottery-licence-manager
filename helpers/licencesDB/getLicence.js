"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLicence = exports.getLicenceWithDB = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const licencesDB_1 = require("../licencesDB");
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
    licenceObj.canUpdate = licencesDB_1.canUpdateObject(licenceObj, reqSession);
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
exports.getLicenceWithDB = getLicenceWithDB;
const getLicence = (licenceID, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB, {
        readonly: true
    });
    const licenceObj = exports.getLicenceWithDB(db, licenceID, reqSession, {
        includeTicketTypes: true,
        includeFields: true,
        includeEvents: true,
        includeAmendments: true,
        includeTransactions: true
    });
    db.close();
    return licenceObj;
};
exports.getLicence = getLicence;
