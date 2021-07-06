import sqlite from "better-sqlite3";
import { getMaxOrganizationBankRecordIndexWithDB } from "./getMaxOrganizationBankRecordIndex.js";
import { licencesDB as databasePath } from "../../data/databasePaths.js";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
export const addOrganizationBankRecord = (requestBody, requestSession) => {
    const database = sqlite(databasePath);
    const record = database.prepare("select recordIndex, recordDelete_timeMillis" +
        " from OrganizationBankRecords" +
        " where organizationID = ?" +
        " and accountNumber = ?" +
        " and bankingYear = ?" +
        " and bankingMonth = ?" +
        " and bankRecordType = ?")
        .get(requestBody.organizationID, requestBody.accountNumber, requestBody.bankingYear, requestBody.bankingMonth, requestBody.bankRecordType);
    if (record) {
        if (record.recordDelete_timeMillis) {
            const info = database.prepare("delete from OrganizationBankRecords" +
                " where organizationID = ?" +
                " and recordIndex = ?")
                .run(requestBody.organizationID, record.recordIndex);
            if (info.changes === 0) {
                database.close();
                return false;
            }
        }
        else {
            database.close();
            return false;
        }
    }
    const newRecordIndex = getMaxOrganizationBankRecordIndexWithDB(database, requestBody.organizationID) + 1;
    const nowMillis = Date.now();
    const info = database.prepare("insert into OrganizationBankRecords" +
        " (organizationID, recordIndex," +
        " accountNumber, bankingYear, bankingMonth, bankRecordType, recordIsNA, recordDate, recordNote," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(requestBody.organizationID, newRecordIndex, requestBody.accountNumber, requestBody.bankingYear, requestBody.bankingMonth, requestBody.bankRecordType, requestBody.recordIsNA ? 1 : 0, dateTimeFns.dateStringToInteger(requestBody.recordDateString), requestBody.recordNote, requestSession.user.userName, nowMillis, requestSession.user.userName, nowMillis);
    database.close();
    return info.changes > 0;
};
