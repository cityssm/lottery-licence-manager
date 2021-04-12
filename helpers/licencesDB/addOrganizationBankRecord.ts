import * as sqlite from "better-sqlite3";

import { getMaxOrganizationBankRecordIndexWithDB } from "./getMaxOrganizationBankRecordIndex";

import { licencesDB as dbPath } from "../../data/databasePaths";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";

import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";


export const addOrganizationBankRecord = (reqBody: llm.OrganizationBankRecord, reqSession: expressSession.Session) => {

  // Check for a record with the same unique key

  const db = sqlite(dbPath);

  const record = db.prepare("select recordIndex, recordDelete_timeMillis" +
    " from OrganizationBankRecords" +
    " where organizationID = ?" +
    " and accountNumber = ?" +
    " and bankingYear = ?" +
    " and bankingMonth = ?" +
    " and bankRecordType = ?")
    .get(reqBody.organizationID,
      reqBody.accountNumber,
      reqBody.bankingYear,
      reqBody.bankingMonth,
      reqBody.bankRecordType);

  if (record) {

    if (record.recordDelete_timeMillis) {

      const info = db.prepare("delete from OrganizationBankRecords" +
        " where organizationID = ?" +
        " and recordIndex = ?")
        .run(reqBody.organizationID, record.recordIndex);

      if (info.changes === 0) {

        // Record not deleted
        db.close();
        return false;
      }

    } else {

      // An active record already exists
      db.close();
      return false;
    }
  }

  // Get next recordIndex

  const newRecordIndex = getMaxOrganizationBankRecordIndexWithDB(db, reqBody.organizationID) + 1;

  // Insert the record

  const nowMillis = Date.now();

  const info = db.prepare("insert into OrganizationBankRecords" +
    " (organizationID, recordIndex," +
    " accountNumber, bankingYear, bankingMonth, bankRecordType, recordIsNA, recordDate, recordNote," +
    " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
    " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(reqBody.organizationID,
      newRecordIndex,
      reqBody.accountNumber,
      reqBody.bankingYear,
      reqBody.bankingMonth,
      reqBody.bankRecordType,
      reqBody.recordIsNA ? 1 : 0,
      dateTimeFns.dateStringToInteger(reqBody.recordDateString),
      reqBody.recordNote,
      reqSession.user.userName,
      nowMillis,
      reqSession.user.userName,
      nowMillis
    );

  db.close();

  return info.changes > 0;
};
