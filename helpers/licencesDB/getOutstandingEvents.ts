import * as sqlite from "better-sqlite3";

import * as configFns from "../configFns";
import { canUpdateObject } from "../licencesDB";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";
import { licencesDB as dbPath } from "../../data/databasePaths";

import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";


export const getOutstandingEvents = (reqBody: {
  eventDateType?: string;
  licenceTypeKey?: string;
}, reqSession: expressSession.Session) => {

  const db = sqlite(dbPath, {
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
      // " or e.bank_name is null or e.bank_name = ''" +
      // " or e.costs_receipts is null or e.costs_receipts = 0" +
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
    } else if (reqBody.eventDateType === "upcoming") {
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

  const events: llm.LotteryEvent[] =
    db.prepare(sql).all(sqlParams);

  db.close();

  for (const lotteryEvent of events) {
    lotteryEvent.recordType = "event";

    lotteryEvent.eventDateString = dateTimeFns.dateIntegerToString(lotteryEvent.eventDate);
    lotteryEvent.reportDateString = dateTimeFns.dateIntegerToString(lotteryEvent.reportDate);

    lotteryEvent.licenceType = (configFns.getLicenceType(lotteryEvent.licenceTypeKey) || {}).licenceType || "";

    lotteryEvent.bank_name_isOutstanding = (lotteryEvent.bank_name === null || lotteryEvent.bank_name === "");

    lotteryEvent.canUpdate = canUpdateObject(lotteryEvent, reqSession);
  }

  return events;
};
