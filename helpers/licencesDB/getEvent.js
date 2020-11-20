"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEvent = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const licencesDB_1 = require("../licencesDB");
const getEvent = (licenceID, eventDate, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB, {
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
        eventObj.canUpdate = licencesDB_1.canUpdateObject(eventObj, reqSession);
        const rows = db.prepare("select fieldKey, fieldValue" +
            " from LotteryEventFields" +
            " where licenceID = ? and eventDate = ?")
            .all(licenceID, eventDate);
        eventObj.eventFields = rows || [];
    }
    db.close();
    return eventObj;
};
exports.getEvent = getEvent;
