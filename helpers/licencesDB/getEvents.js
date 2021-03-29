"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEvents = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const licencesDB_1 = require("../licencesDB");
const getEvents = (reqBody, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB, {
        readonly: true
    });
    const sqlParams = [reqBody.eventYear, reqBody.eventYear];
    let sql = "select e.eventDate, e.bank_name," +
        " sum(coalesce(c.costs_receipts, 0)) as costs_receiptsSum," +
        " l.licenceID, l.externalLicenceNumber, l.licenceTypeKey, l.licenceDetails," +
        " lo.locationName, lo.locationAddress1," +
        " l.startTime, l.endTime," +
        " o.organizationName," +
        " e.recordCreate_userName, e.recordCreate_timeMillis, e.recordUpdate_userName, e.recordUpdate_timeMillis" +
        " from LotteryEvents e" +
        " left join LotteryLicences l on e.licenceID = l.licenceID" +
        " left join Locations lo on l.locationID = lo.locationID" +
        " left join Organizations o on l.organizationID = o.organizationID" +
        " left join LotteryEventCosts c on e.licenceID = c.licenceID and e.eventDate = c.eventDate" +
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
    sql += " group by e.eventDate, e.bank_name," +
        " l.licenceID, l.externalLicenceNumber, l.licenceTypeKey, l.licenceDetails," +
        " lo.locationName, lo.locationAddress1, l.startTime, l.endTime, o.organizationName," +
        " e.recordCreate_userName, e.recordCreate_timeMillis, e.recordUpdate_userName, e.recordUpdate_timeMillis" +
        " order by e.eventDate, l.startTime";
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
        lotteryEvent.canUpdate = licencesDB_1.canUpdateObject(lotteryEvent, reqSession);
        delete lotteryEvent.locationName;
        delete lotteryEvent.locationAddress1;
        delete lotteryEvent.bank_name;
    }
    return events;
};
exports.getEvents = getEvents;
