import sqlite from "better-sqlite3";
import { licencesDB as databasePath } from "../../data/databasePaths.js";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";

import { getMaxTransactionIndexWithDB } from "./getMaxTransactionIndex.js";
import { getLicenceWithDB } from "./getLicence.js";
import { addLicenceAmendmentWithDB } from "./addLicenceAmendment.js";

import type * as expressSession from "express-session";


export const addTransaction = (requestBody: {
  licenceID: string;
  transactionAmount: string;
  transactionNote: string;
  externalReceiptNumber: string;
  issueLicence: "" | "true";
}, requestSession: expressSession.Session): number => {

  const database = sqlite(databasePath);

  const licenceObject = getLicenceWithDB(database, requestBody.licenceID, requestSession, {
    includeTicketTypes: false,
    includeFields: false,
    includeEvents: false,
    includeAmendments: false,
    includeTransactions: false
  });

  const newTransactionIndex: number = getMaxTransactionIndexWithDB(database, requestBody.licenceID) + 1;

  const rightNow = new Date();

  const transactionDate = dateTimeFns.dateToInteger(rightNow);
  const transactionTime = dateTimeFns.dateToTimeInteger(rightNow);

  database.prepare("insert into LotteryLicenceTransactions (" +
    "licenceID, transactionIndex," +
    " transactionDate, transactionTime," +
    " externalReceiptNumber, transactionAmount, transactionNote," +
    " recordCreate_userName, recordCreate_timeMillis," +
    " recordUpdate_userName, recordUpdate_timeMillis)" +
    " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(
      requestBody.licenceID,
      newTransactionIndex,
      transactionDate,
      transactionTime,
      requestBody.externalReceiptNumber,
      requestBody.transactionAmount,
      requestBody.transactionNote,
      requestSession.user.userName,
      rightNow.getTime(),
      requestSession.user.userName,
      rightNow.getTime()
    );

  if (licenceObject.trackUpdatesAsAmendments) {

    addLicenceAmendmentWithDB(
      database,
      requestBody.licenceID,
      "New Transaction",
      "",
      1,
      requestSession
    );

  }

  if (requestBody.issueLicence === "true") {

    database.prepare("update LotteryLicences" +
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
        requestSession.user.userName,
        rightNow.getTime(),
        requestBody.licenceID
      );
  }

  database.close();

  return newTransactionIndex;
};
