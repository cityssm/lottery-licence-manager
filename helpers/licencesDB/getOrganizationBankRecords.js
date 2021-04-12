"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrganizationBankRecords = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const getOrganizationBankRecords = (organizationID, accountNumber, bankingYear) => {
    const db = sqlite(databasePaths_1.licencesDB, {
        readonly: true
    });
    const bankRecords = db.prepare("select recordIndex," +
        " bankingMonth, bankRecordType," +
        " recordDate, recordNote, recordIsNA," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis" +
        " from OrganizationBankRecords" +
        " where recordDelete_timeMillis is null" +
        " and organizationID = ?" +
        " and accountNumber = ?" +
        " and bankingYear = ?")
        .all(organizationID, accountNumber, bankingYear);
    db.close();
    for (const bankRecord of bankRecords) {
        bankRecord.recordDateString = dateTimeFns.dateIntegerToString(bankRecord.recordDate);
    }
    return bankRecords;
};
exports.getOrganizationBankRecords = getOrganizationBankRecords;
