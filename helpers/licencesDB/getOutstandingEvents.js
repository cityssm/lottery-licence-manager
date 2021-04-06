"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOutstandingEvents = void 0;
const sqlite = require("better-sqlite3");
const configFns = require("../configFns");
const licencesDB_1 = require("../licencesDB");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const databasePaths_1 = require("../../data/databasePaths");
const getOutstandingEvents = (reqBody, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB, {
        readonly: true
    });
    const sqlParams = [];
    let sql = "select" +
        " o.organizationID, o.organizationName," +
        " e.eventDate, e.reportDate," +
        " l.licenceTypeKey, l.licenceID, l.externalLicenceNumber," +
        " e.bank_name, e.bank_address, e.bank_accountNumber, e.bank_accountBalance," +
        " sum(c.costs_receipts) as costs_receiptsSum," +
        " e.recordUpdate_userName, e.recordUpdate_timeMillis" +
        " from LotteryEvents e" +
        " left join LotteryLicences l on e.licenceID = l.licenceID" +
        " left join Organizations o on l.organizationID = o.organizationID" +
        " left join LotteryEventCosts c on e.licenceID = c.licenceID and e.eventDate = c.eventDate" +
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
    sql +=
        " group by o.organizationID, o.organizationName," +
            " e.eventDate, e.reportDate," +
            " l.licenceTypeKey, l.licenceID, l.externalLicenceNumber," +
            " e.bank_name, e.bank_address, e.bank_accountNumber, e.bank_accountBalance," +
            " e.recordUpdate_userName, e.recordUpdate_timeMillis" +
            " order by o.organizationName, o.organizationID, e.eventDate, l.licenceID";
    const events = db.prepare(sql).all(sqlParams);
    db.close();
    for (const lotteryEvent of events) {
        lotteryEvent.recordType = "event";
        lotteryEvent.eventDateString = dateTimeFns.dateIntegerToString(lotteryEvent.eventDate);
        lotteryEvent.reportDateString = dateTimeFns.dateIntegerToString(lotteryEvent.reportDate);
        lotteryEvent.licenceType = (configFns.getLicenceType(lotteryEvent.licenceTypeKey) || {}).licenceType || "";
        lotteryEvent.bank_name_isOutstanding = (lotteryEvent.bank_name === null || lotteryEvent.bank_name === "");
        lotteryEvent.canUpdate = licencesDB_1.canUpdateObject(lotteryEvent, reqSession);
    }
    return events;
};
exports.getOutstandingEvents = getOutstandingEvents;
