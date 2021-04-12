import * as sqlite from "better-sqlite3";
import { licencesDB as dbPath } from "../../data/databasePaths";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";

import { canUpdateObject } from "../licencesDB";
import { getLicenceTicketTypesWithDB } from "./getLicenceTicketTypes";
import { getLicenceAmendmentsWithDB } from "./getLicenceAmendments";

import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";


export const getLicenceWithDB = (db: sqlite.Database, licenceID: number | string,
  reqSession: expressSession.Session,
  queryOptions: {
    includeTicketTypes: boolean;
    includeFields: boolean;
    includeEvents: boolean;
    includeAmendments: boolean;
    includeTransactions: boolean;
  }) => {

  const licenceObj: llm.LotteryLicence =
    db.prepare("select l.*," +
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

  licenceObj.canUpdate = canUpdateObject(licenceObj, reqSession);

  if (queryOptions) {

    /*
     * Ticket types
     */

    if ("includeTicketTypes" in queryOptions && queryOptions.includeTicketTypes) {
      licenceObj.licenceTicketTypes = getLicenceTicketTypesWithDB(db, licenceID);
    }

    /*
     * Licence fields
     */

    if ("includeFields" in queryOptions && queryOptions.includeFields) {

      const fieldList = db.prepare("select * from LotteryLicenceFields" +
        " where licenceID = ?")
        .all(licenceID);

      licenceObj.licenceFields = fieldList;

    }

    /*
     * Events
     */

    if ("includeEvents" in queryOptions && queryOptions.includeEvents) {

      const eventList = db.prepare("select eventDate," +
        " costs_amountDonated" +
        " from LotteryEvents" +
        " where licenceID = ?" +
        " and recordDelete_timeMillis is null" +
        " order by eventDate")
        .all(licenceID);

      for (const eventObj of eventList) {

        eventObj.eventDateString = dateTimeFns.dateIntegerToString(eventObj.eventDate);
      }

      licenceObj.events = eventList;
    }

    /*
     * Licence amendments
     */

    if ("includeAmendments" in queryOptions && queryOptions.includeAmendments) {
      licenceObj.licenceAmendments = getLicenceAmendmentsWithDB(db, licenceID);
    }

    /*
     * Transactions
     */

    if ("includeTransactions" in queryOptions && queryOptions.includeTransactions) {

      const transactions: llm.LotteryLicenceTransaction[] =
        db.prepare("select * from LotteryLicenceTransactions" +
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


export const getLicence = (licenceID: number, reqSession: expressSession.Session): llm.LotteryLicence => {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const licenceObj = getLicenceWithDB(db, licenceID, reqSession, {
    includeTicketTypes: true,
    includeFields: true,
    includeEvents: true,
    includeAmendments: true,
    includeTransactions: true
  });

  db.close();

  return licenceObj;

};
