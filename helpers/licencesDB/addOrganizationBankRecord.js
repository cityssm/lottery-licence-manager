"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addOrganizationBankRecord = void 0;
const sqlite = require("better-sqlite3");
const getMaxOrganizationBankRecordIndex_1 = require("./getMaxOrganizationBankRecordIndex");
const databasePaths_1 = require("../../data/databasePaths");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const addOrganizationBankRecord = (reqBody, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB);
    const record = db.prepare("select recordIndex, recordDelete_timeMillis" +
        " from OrganizationBankRecords" +
        " where organizationID = ?" +
        " and accountNumber = ?" +
        " and bankingYear = ?" +
        " and bankingMonth = ?" +
        " and bankRecordType = ?")
        .get(reqBody.organizationID, reqBody.accountNumber, reqBody.bankingYear, reqBody.bankingMonth, reqBody.bankRecordType);
    if (record) {
        if (record.recordDelete_timeMillis) {
            const info = db.prepare("delete from OrganizationBankRecords" +
                " where organizationID = ?" +
                " and recordIndex = ?")
                .run(reqBody.organizationID, record.recordIndex);
            if (info.changes === 0) {
                db.close();
                return false;
            }
        }
        else {
            db.close();
            return false;
        }
    }
    const newRecordIndex = getMaxOrganizationBankRecordIndex_1.getMaxOrganizationBankRecordIndexWithDB(db, reqBody.organizationID) + 1;
    const nowMillis = Date.now();
    const info = db.prepare("insert into OrganizationBankRecords" +
        " (organizationID, recordIndex," +
        " accountNumber, bankingYear, bankingMonth, bankRecordType, recordIsNA, recordDate, recordNote," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(reqBody.organizationID, newRecordIndex, reqBody.accountNumber, reqBody.bankingYear, reqBody.bankingMonth, reqBody.bankRecordType, reqBody.recordIsNA ? 1 : 0, dateTimeFns.dateStringToInteger(reqBody.recordDateString), reqBody.recordNote, reqSession.user.userName, nowMillis, reqSession.user.userName, nowMillis);
    db.close();
    return info.changes > 0;
};
exports.addOrganizationBankRecord = addOrganizationBankRecord;
