import sqlite from "better-sqlite3";
import { licencesDB as databasePath } from "../../data/databasePaths.js";
import { runSQLWithDB } from "../_runSQLByName.js";
import { getLicenceWithDB } from "./getLicence.js";
import { addLicenceAmendmentWithDB } from "./addLicenceAmendment.js";
export const voidTransaction = (licenceID, transactionIndex, requestSession) => {
    const database = sqlite(databasePath);
    const licenceObject = getLicenceWithDB(database, licenceID, requestSession, {
        includeTicketTypes: false,
        includeFields: false,
        includeEvents: false,
        includeAmendments: false,
        includeTransactions: false
    });
    const nowMillis = Date.now();
    const hasChanges = runSQLWithDB(database, "update LotteryLicenceTransactions" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where licenceID = ?" +
        " and transactionIndex = ?" +
        " and recordDelete_timeMillis is null", [
        requestSession.user.userName,
        nowMillis,
        licenceID,
        transactionIndex
    ]).changes > 0;
    if (hasChanges && licenceObject.trackUpdatesAsAmendments) {
        addLicenceAmendmentWithDB(database, licenceID, "Transaction Voided", "", 1, requestSession);
    }
    database.close();
    return hasChanges;
};
