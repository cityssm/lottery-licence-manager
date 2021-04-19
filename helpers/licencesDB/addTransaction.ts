import sqlite from "better-sqlite3";
import { licencesDB as dbPath } from "../../data/databasePaths.js";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";

import { getMaxTransactionIndexWithDB } from "./getMaxTransactionIndex.js";
import { getLicenceWithDB } from "./getLicence.js";
import { addLicenceAmendmentWithDB } from "./addLicenceAmendment.js";

import type * as expressSession from "express-session";


export const addTransaction = (reqBody: {
  licenceID: string;
  transactionAmount: string;
  transactionNote: string;
  externalReceiptNumber: string;
  issueLicence: "" | "true";
}, reqSession: expressSession.Session) => {

  const db = sqlite(dbPath);

  const licenceObj = getLicenceWithDB(db, reqBody.licenceID, reqSession, {
    includeTicketTypes: false,
    includeFields: false,
    includeEvents: false,
    includeAmendments: false,
    includeTransactions: false
  });

  const newTransactionIndex: number = getMaxTransactionIndexWithDB(db, reqBody.licenceID) + 1;

  const rightNow = new Date();

  const transactionDate = dateTimeFns.dateToInteger(rightNow);
  const transactionTime = dateTimeFns.dateToTimeInteger(rightNow);

  db.prepare("insert into LotteryLicenceTransactions (" +
    "licenceID, transactionIndex," +
    " transactionDate, transactionTime," +
    " externalReceiptNumber, transactionAmount, transactionNote," +
    " recordCreate_userName, recordCreate_timeMillis," +
    " recordUpdate_userName, recordUpdate_timeMillis)" +
    " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(
      reqBody.licenceID,
      newTransactionIndex,
      transactionDate,
      transactionTime,
      reqBody.externalReceiptNumber,
      reqBody.transactionAmount,
      reqBody.transactionNote,
      reqSession.user.userName,
      rightNow.getTime(),
      reqSession.user.userName,
      rightNow.getTime()
    );

  if (licenceObj.trackUpdatesAsAmendments) {

    addLicenceAmendmentWithDB(
      db,
      reqBody.licenceID,
      "New Transaction",
      "",
      1,
      reqSession
    );

  }

  if (reqBody.issueLicence === "true") {

    db.prepare("update LotteryLicences" +
      " set issueDate = ?," +
      " issueTime = ?," +
      " trackUpdatesAsAmendments = 1," +
      " recordUpdate_userName = ?," +
      " recordUpdate_timeMillis = ?" +
      " where licenceID = ?" +
      " and recordDelete_timeMillis is null" +
      " and issueDate is null")
      .run(
        transactionDate,
        transactionTime,
        reqSession.user.userName,
        rightNow.getTime(),
        reqBody.licenceID
      );
  }

  db.close();

  return newTransactionIndex;
};
