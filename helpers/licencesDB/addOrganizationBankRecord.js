import sqlite from "better-sqlite3";
import { getMaxOrganizationBankRecordIndexWithDB } from "./getMaxOrganizationBankRecordIndex.js";
import { licencesDB as dbPath } from "../../data/databasePaths.js";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
export const addOrganizationBankRecord = (reqBody, reqSession) => {
    const db = sqlite(dbPath);
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
    const newRecordIndex = getMaxOrganizationBankRecordIndexWithDB(db, reqBody.organizationID) + 1;
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
