"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.voidTransaction = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
const _runSQLByName_1 = require("../_runSQLByName");
const getLicence_1 = require("./getLicence");
const addLicenceAmendment_1 = require("./addLicenceAmendment");
const voidTransaction = (licenceID, transactionIndex, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB);
    const licenceObj = getLicence_1.getLicenceWithDB(db, licenceID, reqSession, {
        includeTicketTypes: false,
        includeFields: false,
        includeEvents: false,
        includeAmendments: false,
        includeTransactions: false
    });
    const nowMillis = Date.now();
    const hasChanges = _runSQLByName_1.runSQLWithDB(db, "update LotteryLicenceTransactions" +
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
        addLicenceAmendment_1.addLicenceAmendmentWithDB(db, licenceID, "Transaction Voided", "", 1, reqSession);
    }
    db.close();
    return hasChanges;
};
exports.voidTransaction = voidTransaction;
