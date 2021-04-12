import * as sqlite from "better-sqlite3";
import { licencesDB as dbPath } from "../../data/databasePaths";

import { runSQLWithDB } from "../_runSQLByName";

import { getLicenceWithDB } from "./getLicence";
import { addLicenceAmendmentWithDB } from "./addLicenceAmendment";

import type * as expressSession from "express-session";


export const voidTransaction =
  (licenceID: number, transactionIndex: number, reqSession: expressSession.Session) => {

    const db = sqlite(dbPath);

    const licenceObj = getLicenceWithDB(db, licenceID, reqSession, {
      includeTicketTypes: false,
      includeFields: false,
      includeEvents: false,
      includeAmendments: false,
      includeTransactions: false
    });

    const nowMillis = Date.now();

    const hasChanges = runSQLWithDB(db,
      "update LotteryLicenceTransactions" +
      " set recordDelete_userName = ?," +
      " recordDelete_timeMillis = ?" +
      " where licenceID = ?" +
      " and transactionIndex = ?" +
      " and recordDelete_timeMillis is null", [
        reqSession.user.userName,
        nowMillis,
        licenceID,
        transactionIndex
      ]).changes > 0;

    if (hasChanges && licenceObj.trackUpdatesAsAmendments) {

      addLicenceAmendmentWithDB(
        db,
        licenceID,
        "Transaction Voided",
        "",
        1,
        reqSession
      );

    }

    db.close();

    return hasChanges;
  };
