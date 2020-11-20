import * as sqlite from "better-sqlite3";
import { licencesDB as dbPath } from "../../data/databasePaths";

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

    const info = db.prepare("update LotteryLicenceTransactions" +
      " set recordDelete_userName = ?," +
      " recordDelete_timeMillis = ?" +
      " where licenceID = ?" +
      " and transactionIndex = ?" +
      " and recordDelete_timeMillis is null")
      .run(
        reqSession.user.userName,
        nowMillis,
        licenceID,
        transactionIndex
      );

    const changeCount = info.changes;

    if (changeCount && licenceObj.trackUpdatesAsAmendments) {

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

    return changeCount > 0;

  };
