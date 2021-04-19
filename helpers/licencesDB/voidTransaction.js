import sqlite from "better-sqlite3";
import { licencesDB as dbPath } from "../../data/databasePaths.js";
import { runSQLWithDB } from "../_runSQLByName.js";
import { getLicenceWithDB } from "./getLicence.js";
import { addLicenceAmendmentWithDB } from "./addLicenceAmendment.js";
export const voidTransaction = (licenceID, transactionIndex, reqSession) => {
    const db = sqlite(dbPath);
    const licenceObj = getLicenceWithDB(db, licenceID, reqSession, {
        includeTicketTypes: false,
        includeFields: false,
        includeEvents: false,
        includeAmendments: false,
        includeTransactions: false
    });
    const nowMillis = Date.now();
    const hasChanges = runSQLWithDB(db, "update LotteryLicenceTransactions" +
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
        addLicenceAmendmentWithDB(db, licenceID, "Transaction Voided", "", 1, reqSession);
    }
    db.close();
    return hasChanges;
};
