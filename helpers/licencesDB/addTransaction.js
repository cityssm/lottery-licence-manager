"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTransaction = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const getLicence_1 = require("./getLicence");
const addLicenceAmendment_1 = require("./addLicenceAmendment");
exports.addTransaction = (reqBody, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB);
    const licenceObj = getLicence_1.getLicenceWithDB(db, reqBody.licenceID, reqSession, {
        includeTicketTypes: false,
        includeFields: false,
        includeEvents: false,
        includeAmendments: false,
        includeTransactions: false
    });
    const row = db.prepare("select ifnull(max(transactionIndex), -1) as maxIndex" +
        " from LotteryLicenceTransactions" +
        " where licenceID = ?")
        .get(reqBody.licenceID);
    const newTransactionIndex = row.maxIndex + 1;
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
        .run(reqBody.licenceID, newTransactionIndex, transactionDate, transactionTime, reqBody.externalReceiptNumber, reqBody.transactionAmount, reqBody.transactionNote, reqSession.user.userName, rightNow.getTime(), reqSession.user.userName, rightNow.getTime());
    if (licenceObj.trackUpdatesAsAmendments) {
        addLicenceAmendment_1.addLicenceAmendmentWithDB(db, reqBody.licenceID, "New Transaction", "", 1, reqSession);
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
            .run(transactionDate, transactionTime, reqSession.user.userName, rightNow.getTime(), reqBody.licenceID);
    }
    db.close();
    return newTransactionIndex;
};
