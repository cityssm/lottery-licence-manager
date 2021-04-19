import sqlite from "better-sqlite3";
import { licencesDB as dbPath } from "../../data/databasePaths.js";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import { canUpdateObject } from "../licencesDB.js";
export const getEvent = (licenceID, eventDate, reqSession) => {
    const db = sqlite(dbPath, {
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
        eventObj.canUpdate = canUpdateObject(eventObj, reqSession);
        let rows = db.prepare("select fieldKey, fieldValue" +
            " from LotteryEventFields" +
            " where licenceID = ? and eventDate = ?")
            .all(licenceID, eventDate);
        eventObj.eventFields = rows || [];
        rows = db.prepare("select t.ticketType," +
            " c.costs_receipts, c.costs_admin, c.costs_prizesAwarded" +
            " from LotteryLicenceTicketTypes t" +
            " left join LotteryEventCosts c on t.licenceID = c.licenceID and t.eventDate = c.eventDate and t.ticketType = c.ticketType" +
            " where t.licenceID = ?" +
            " and t.eventDate = ?" +
            " order by t.ticketType")
            .all(licenceID, eventDate);
        eventObj.eventCosts = rows || [];
        if (eventObj.eventCosts.length === 0) {
            rows = db.prepare("select c.ticketType," +
                " c.costs_receipts, c.costs_admin, c.costs_prizesAwarded" +
                " from LotteryEventCosts c" +
                " where c.licenceID = ?" +
                " and c.eventDate = ?" +
                " order by c.ticketType")
                .all(licenceID, eventDate);
            eventObj.eventCosts = rows || [];
        }
        if (eventObj.eventCosts.length === 0) {
            eventObj.eventCosts.push({
                ticketType: null,
                costs_receipts: null,
                costs_admin: null,
                costs_prizesAwarded: null
            });
        }
    }
    db.close();
    return eventObj;
};
