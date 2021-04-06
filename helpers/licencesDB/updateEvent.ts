import * as sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";

import * as licencesDB from "../licencesDB";

import { licencesDB as dbPath } from "../../data/databasePaths";

import type * as expressSession from "express-session";


interface UpdateEventForm {
  licenceID: string;
  eventDate: string;
  reportDateString: string;
  bank_name: string;
  bank_address: string;
  bank_accountNumber: string;
  bank_accountBalance: string;
  costs_amountDonated: string;
  fieldKeys: string;
  ticketTypes: string;
};


export const updateEvent = (reqBody: UpdateEventForm, reqSession: expressSession.Session): boolean => {

  const db = sqlite(dbPath);

  const nowMillis = Date.now();

  const info = db.prepare("update LotteryEvents" +
    " set reportDate = ?," +
    " bank_name = ?," +
    " bank_address = ?," +
    " bank_accountNumber = ?," +
    " bank_accountBalance = ?," +
    " costs_amountDonated = ?," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where licenceID = ?" +
    " and eventDate = ?" +
    " and recordDelete_timeMillis is null")
    .run(
      (reqBody.reportDateString === "" ? null : dateTimeFns.dateStringToInteger(reqBody.reportDateString)),
      reqBody.bank_name,
      reqBody.bank_address,
      reqBody.bank_accountNumber,
      (reqBody.bank_accountBalance === "" ? null : reqBody.bank_accountBalance),
      (reqBody.costs_amountDonated === "" ? null : reqBody.costs_amountDonated),
      reqSession.user.userName,
      nowMillis,
      reqBody.licenceID,
      reqBody.eventDate
    );

  const changeCount = info.changes;

  if (!changeCount) {

    db.close();
    return false;
  }

  // Costs

  db.prepare("delete from LotteryEventCosts" +
    " where licenceID = ?" +
    " and eventDate = ?")
    .run(reqBody.licenceID, reqBody.eventDate);

  const ticketTypes = reqBody.ticketTypes.split(",");

  for (const ticketType of ticketTypes) {

    const costs_receipts = reqBody["costs_receipts-" + ticketType];
    const costs_admin = reqBody["costs_admin-" + ticketType];
    const costs_prizesAwarded = reqBody["costs_prizesAwarded-" + ticketType];

    db.prepare("insert into LotteryEventCosts" +
      " (licenceID, eventDate, ticketType, costs_receipts, costs_admin, costs_prizesAwarded)" +
      " values (?, ?, ?, ?, ?, ?)")
      .run(reqBody.licenceID,
        reqBody.eventDate,
        (ticketType === "" ? null : ticketType),
        (costs_receipts === "" ? null : costs_receipts),
        (costs_admin === "" ? null : costs_admin),
        (costs_prizesAwarded === "" ? null : costs_prizesAwarded));
  }

  // Fields

  db.prepare("delete from LotteryEventFields" +
    " where licenceID = ?" +
    " and eventDate = ?")
    .run(reqBody.licenceID, reqBody.eventDate);

  const fieldKeys = reqBody.fieldKeys.split(",");

  for (const fieldKey of fieldKeys) {

    const fieldValue = reqBody[fieldKey];

    if (fieldValue !== "") {

      db.prepare("insert into LotteryEventFields" +
        " (licenceID, eventDate, fieldKey, fieldValue)" +
        " values (?, ?, ?, ?)")
        .run(reqBody.licenceID, reqBody.eventDate, fieldKey, fieldValue);
    }
  }

  db.close();

  // Purge cached stats
  licencesDB.resetEventTableStats();

  return changeCount > 0;
};
