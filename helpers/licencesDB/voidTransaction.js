"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.voidTransaction = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
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
    const info = db.prepare("update LotteryLicenceTransactions" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where licenceID = ?" +
        " and transactionIndex = ?" +
        " and recordDelete_timeMillis is null")
        .run(reqSession.user.userName, nowMillis, licenceID, transactionIndex);
    const changeCount = info.changes;
    if (changeCount && licenceObj.trackUpdatesAsAmendments) {
        addLicenceAmendment_1.addLicenceAmendmentWithDB(db, licenceID, "Transaction Voided", "", 1, reqSession);
    }
    db.close();
    return changeCount > 0;
};
exports.voidTransaction = voidTransaction;
