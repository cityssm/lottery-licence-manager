import { canUpdateObject } from "./licencesDB";
import * as sqlite from "better-sqlite3";

import { licencesDB as dbPath } from "../data/databasePaths";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";
import type * as llm from "../types/recordTypes";


/*
 * ORGANIZATIONS
 */


/**
 * @returns New organizationID
 */
export const createOrganization = (reqBody: llm.Organization, reqSession: Express.SessionData) => {

  const db = sqlite(dbPath);

  const nowMillis = Date.now();

  const info = db.prepare("insert into Organizations (" +
    "organizationName, organizationAddress1, organizationAddress2," +
    " organizationCity, organizationProvince, organizationPostalCode," +
    " organizationNote," +
    " recordCreate_userName, recordCreate_timeMillis," +
    " recordUpdate_userName, recordUpdate_timeMillis)" +
    " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(
      reqBody.organizationName,
      reqBody.organizationAddress1,
      reqBody.organizationAddress2,
      reqBody.organizationCity,
      reqBody.organizationProvince,
      reqBody.organizationPostalCode,
      "",
      reqSession.user.userName,
      nowMillis,
      reqSession.user.userName,
      nowMillis
    );

  db.close();

  return Number(info.lastInsertRowid);

};


/**
 * @returns TRUE if successful
 */
export const updateOrganization = (reqBody: llm.Organization, reqSession: Express.SessionData): boolean => {

  const db = sqlite(dbPath);

  const nowMillis = Date.now();

  const info = db.prepare("update Organizations" +
    " set organizationName = ?," +
    " organizationAddress1 = ?," +
    " organizationAddress2 = ?," +
    " organizationCity = ?," +
    " organizationProvince = ?," +
    " organizationPostalCode = ?," +
    " trustAccountNumber = ?," +
    " fiscalStartDate = ?," +
    " fiscalEndDate = ?," +
    " isEligibleForLicences = ?," +
    " organizationNote = ?," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where organizationID = ?" +
    " and recordDelete_timeMillis is null")
    .run(
      reqBody.organizationName,
      reqBody.organizationAddress1,
      reqBody.organizationAddress2,
      reqBody.organizationCity,
      reqBody.organizationProvince,
      reqBody.organizationPostalCode,
      reqBody.trustAccountNumber,
      dateTimeFns.dateStringToInteger(reqBody.fiscalStartDateString),
      dateTimeFns.dateStringToInteger(reqBody.fiscalEndDateString),
      reqBody.isEligibleForLicences,
      reqBody.organizationNote,
      reqSession.user.userName,
      nowMillis,
      reqBody.organizationID
    );

  db.close();

  return info.changes > 0;

};


/**
 * @returns TRUE if successful
 */
export const deleteOrganization = (organizationID: number, reqSession: Express.SessionData): boolean => {

  const db = sqlite(dbPath);

  const nowMillis = Date.now();

  const info = db.prepare("update Organizations" +
    " set recordDelete_userName = ?," +
    " recordDelete_timeMillis = ?" +
    " where organizationID = ?" +
    " and recordDelete_timeMillis is null")
    .run(
      reqSession.user.userName,
      nowMillis,
      organizationID
    );

  db.close();

  return info.changes > 0;

};


/**
 * @returns TRUE if successful
 */
export const restoreOrganization = (organizationID: number, reqSession: Express.SessionData): boolean => {

  const db = sqlite(dbPath);

  const nowMillis = Date.now();

  const info = db.prepare("update Organizations" +
    " set recordDelete_userName = null," +
    " recordDelete_timeMillis = null," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where organizationID = ?" +
    " and recordDelete_timeMillis is not null")
    .run(
      reqSession.user.userName,
      nowMillis,
      organizationID
    );

  db.close();

  return info.changes > 0;

};


export const getInactiveOrganizations = (inactiveYears: number) => {

  const cutoffDate = new Date();
  cutoffDate.setFullYear(cutoffDate.getFullYear() - inactiveYears);

  const cutoffDateInteger = dateTimeFns.dateToInteger(cutoffDate);

  const db = sqlite(dbPath, {
    readonly: true
  });

  const rows: llm.Organization[] = db.prepare("select o.organizationID, o.organizationName," +
    " o.recordCreate_timeMillis, o.recordCreate_userName," +
    " o.recordUpdate_timeMillis, o.recordUpdate_userName," +
    " l.licences_endDateMax" +
    " from Organizations o" +
    " left join (" +
    ("select l.organizationID, max(l.endDate) as licences_endDateMax from LotteryLicences l" +
      " where l.recordDelete_timeMillis is null" +
      " group by l.organizationID" +
      ") l on o.organizationID = l.organizationID") +
    " where o.recordDelete_timeMillis is null" +
    " and (l.licences_endDateMax is null or l.licences_endDateMax <= ?)" +
    " order by o.organizationName, o.organizationID")
    .all(cutoffDateInteger);

  db.close();

  for (const organization of rows) {

    organization.recordCreate_dateString = dateTimeFns.dateToString(new Date(organization.recordCreate_timeMillis));
    organization.recordUpdate_dateString = dateTimeFns.dateToString(new Date(organization.recordUpdate_timeMillis));
    organization.licences_endDateMaxString = dateTimeFns.dateIntegerToString(organization.licences_endDateMax || 0);
  }

  return rows;
};


export const getDeletedOrganizations = () => {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const organizations: llm.Organization[] =
    db.prepare("select organizationID, organizationName, recordDelete_timeMillis, recordDelete_userName" +
      " from Organizations" +
      " where recordDelete_timeMillis is not null" +
      " order by organizationName, recordDelete_timeMillis desc")
      .all();

  db.close();

  for (const organization of organizations) {
    organization.recordDelete_dateString = dateTimeFns.dateToString(new Date(organization.recordDelete_timeMillis));
  }

  return organizations;
};


/*
 * ORGANIZATION REPRESENTATIVES
 */


export const deleteOrganizationRepresentative = (organizationID: number, representativeIndex: number) => {

  const db = sqlite(dbPath);

  const info = db.prepare("delete from OrganizationRepresentatives" +
    " where organizationID = ?" +
    " and representativeIndex = ?")
    .run(organizationID, representativeIndex);

  db.close();

  return info.changes > 0;
};


export const setDefaultOrganizationRepresentative = (organizationID: number, representativeIndex: number) => {

  const db = sqlite(dbPath);

  db.prepare("update OrganizationRepresentatives" +
    " set isDefault = 0" +
    " where organizationID = ?")
    .run(organizationID);

  db.prepare("update OrganizationRepresentatives" +
    " set isDefault = 1" +
    " where organizationID = ?" +
    " and representativeIndex = ?")
    .run(organizationID, representativeIndex);

  db.close();

  return true;
};


/*
 * ORGANIZATION REMARKS
 */


export const getOrganizationRemark =
  (organizationID: number, remarkIndex: number, reqSession: Express.SessionData) => {

    const db = sqlite(dbPath, {
      readonly: true
    });

    const remark: llm.OrganizationRemark =
      db.prepare("select" +
        " remarkDate, remarkTime," +
        " remark, isImportant," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis" +
        " from OrganizationRemarks" +
        " where recordDelete_timeMillis is null" +
        " and organizationID = ?" +
        " and remarkIndex = ?")
        .get(organizationID, remarkIndex);

    db.close();

    remark.recordType = "remark";

    remark.remarkDateString = dateTimeFns.dateIntegerToString(remark.remarkDate || 0);
    remark.remarkTimeString = dateTimeFns.timeIntegerToString(remark.remarkTime || 0);

    remark.canUpdate = canUpdateObject(remark, reqSession);

    return remark;
  };


export const addOrganizationRemark = (reqBody: llm.OrganizationRemark, reqSession: Express.SessionData) => {

  const db = sqlite(dbPath);

  const row: {
    maxIndex: number;
  } = db.prepare("select ifnull(max(remarkIndex), -1) as maxIndex" +
    " from OrganizationRemarks" +
    " where organizationID = ?")
    .get(reqBody.organizationID);

  const newRemarkIndex = row.maxIndex + 1;

  const rightNow = new Date();

  const remarkDate = dateTimeFns.dateToInteger(rightNow);
  const remarkTime = dateTimeFns.dateToTimeInteger(rightNow);

  db.prepare("insert into OrganizationRemarks (" +
    "organizationID, remarkIndex," +
    " remarkDate, remarkTime, remark, isImportant," +
    " recordCreate_userName, recordCreate_timeMillis," +
    " recordUpdate_userName, recordUpdate_timeMillis)" +
    " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(
      reqBody.organizationID, newRemarkIndex,
      remarkDate, remarkTime,
      reqBody.remark, 0,
      reqSession.user.userName,
      rightNow.getTime(),
      reqSession.user.userName,
      rightNow.getTime()
    );

  db.close();

  return newRemarkIndex;
};


/**
 * @returns TRUE if successful
 */
export const updateOrganizationRemark = (reqBody: llm.OrganizationRemark, reqSession: Express.SessionData) => {

  const db = sqlite(dbPath);

  const nowMillis = Date.now();

  const info = db.prepare("update OrganizationRemarks" +
    " set remarkDate = ?," +
    " remarkTime = ?," +
    " remark = ?," +
    " isImportant = ?," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where organizationID = ?" +
    " and remarkIndex = ?" +
    " and recordDelete_timeMillis is null")
    .run(
      dateTimeFns.dateStringToInteger(reqBody.remarkDateString),
      dateTimeFns.timeStringToInteger(reqBody.remarkTimeString),
      reqBody.remark,
      reqBody.isImportant ? 1 : 0,
      reqSession.user.userName,
      nowMillis,
      reqBody.organizationID,
      reqBody.remarkIndex
    );

  db.close();

  return info.changes > 0;
};


/**
 * @returns TRUE if successful
 */
export const deleteOrganizationRemark =
  (organizationID: number, remarkIndex: number, reqSession: Express.SessionData) => {

    const db = sqlite(dbPath);

    const nowMillis = Date.now();

    const info = db.prepare("update OrganizationRemarks" +
      " set recordDelete_userName = ?," +
      " recordDelete_timeMillis = ?" +
      " where organizationID = ?" +
      " and remarkIndex = ?" +
      " and recordDelete_timeMillis is null")
      .run(
        reqSession.user.userName,
        nowMillis,
        organizationID,
        remarkIndex
      );

    db.close();

    return info.changes > 0;
  };


/*
 * Organization Reminders
 */


export const getOrganizationReminder =
  (organizationID: number, reminderIndex: number, reqSession: Express.SessionData) => {

    const db = sqlite(dbPath, {
      readonly: true
    });

    const reminder: llm.OrganizationReminder =
      db.prepare("select * from OrganizationReminders" +
        " where recordDelete_timeMillis is null" +
        " and organizationID = ?" +
        " and reminderIndex = ?")
        .get(organizationID, reminderIndex);

    db.close();

    if (reminder) {

      reminder.recordType = "reminder";

      reminder.reminderDateString = dateTimeFns.dateIntegerToString(reminder.reminderDate || 0);
      reminder.dismissedDateString = dateTimeFns.dateIntegerToString(reminder.dismissedDate || 0);

      reminder.canUpdate = canUpdateObject(reminder, reqSession);
    }

    return reminder;
  };


export const updateOrganizationReminder = (reqBody: {
  organizationID: string;
  reminderIndex: string;
  reminderTypeKey: string;
  reminderDateString?: string;
  reminderStatus: string;
  reminderNote: string;
  dismissedDateString: string;
}, reqSession: Express.SessionData) => {

  const db = sqlite(dbPath);

  const nowMillis = Date.now();

  const info = db.prepare("update OrganizationReminders" +
    " set reminderTypeKey = ?," +
    " reminderDate = ?," +
    " reminderStatus = ?," +
    " reminderNote = ?," +
    " dismissedDate = ?," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where organizationID = ?" +
    " and reminderIndex = ?" +
    " and recordDelete_timeMillis is null")
    .run(
      reqBody.reminderTypeKey,
      (reqBody.reminderDateString === ""
        ? null
        : dateTimeFns.dateStringToInteger(reqBody.reminderDateString)),
      reqBody.reminderStatus,
      reqBody.reminderNote,
      (reqBody.dismissedDateString === ""
        ? null
        : dateTimeFns.dateStringToInteger(reqBody.dismissedDateString)),
      reqSession.user.userName,
      nowMillis,
      reqBody.organizationID,
      reqBody.reminderIndex
    );

  db.close();

  return info.changes > 0;
};


export const dismissOrganizationReminder =
  (organizationID: number, reminderIndex: number, reqSession: Express.SessionData) => {

    const currentDate = new Date();

    const db = sqlite(dbPath);

    const info = db.prepare("update OrganizationReminders" +
      " set dismissedDate = ?," +
      " recordUpdate_userName = ?," +
      " recordUpdate_timeMillis = ?" +
      " where organizationID = ?" +
      " and reminderIndex = ?" +
      " and dismissedDate is null" +
      " and recordDelete_timeMillis is null")
      .run(dateTimeFns.dateToInteger(currentDate),
        reqSession.user.userName, currentDate.getTime(),
        organizationID, reminderIndex);

    db.close();

    return info.changes > 0;
  };


/*
 * ORGANIZATION BANK RECORDS
 */


export const getOrganizationBankRecords = (organizationID: number, accountNumber: string, bankingYear: number) => {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const bankRecords: llm.OrganizationBankRecord[] =
    db.prepare("select recordIndex," +
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


export const getOrganizationBankRecordStats = (organizationID: number) => {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const rows = db.prepare("select accountNumber," +
    " min(bankingYear) as bankingYearMin," +
    " max(bankingYear) as bankingYearMax" +
    " from OrganizationBankRecords" +
    " where recordDelete_timeMillis is null" +
    " and organizationID = ?" +
    " group by accountNumber" +
    " order by bankingYearMax desc, accountNumber")

    .all(organizationID);

  db.close();

  return rows;
};


export const addOrganizationBankRecord = (reqBody: llm.OrganizationBankRecord, reqSession: Express.Session) => {

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

  const row = db.prepare("select ifnull(max(recordIndex), -1) as maxIndex" +
    " from OrganizationBankRecords" +
    " where organizationID = ?")
    .get(reqBody.organizationID);

  const newRecordIndex = row.maxIndex as number + 1;

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
      reqBody.recordIsNA || 0,
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


export const updateOrganizationBankRecord = (reqBody: llm.OrganizationBankRecord, reqSession: Express.Session) => {

  const db = sqlite(dbPath);

  const nowMillis = Date.now();

  const info = db.prepare("update OrganizationBankRecords" +
    " set recordDate = ?," +
    " recordIsNA = ?," +
    " recordNote = ?," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where organizationID = ?" +
    " and recordIndex = ?" +
    " and recordDelete_timeMillis is null")
    .run(
      dateTimeFns.dateStringToInteger(reqBody.recordDateString),
      reqBody.recordIsNA || 0,
      reqBody.recordNote,
      reqSession.user.userName,
      nowMillis,
      reqBody.organizationID,
      reqBody.recordIndex
    );

  db.close();

  return info.changes > 0;
};


export const deleteOrganizationBankRecord =
  (organizationID: number, recordIndex: number, reqSession: Express.Session) => {

    const db = sqlite(dbPath);

    const nowMillis = Date.now();

    const info = db.prepare("update OrganizationBankRecords" +
      " set recordDelete_userName = ?," +
      " recordDelete_timeMillis = ?" +
      " where organizationID = ?" +
      " and recordIndex = ?" +
      " and recordDelete_timeMillis is null")
      .run(
        reqSession.user.userName,
        nowMillis,
        organizationID,
        recordIndex
      );

    db.close();

    return info.changes > 0;
  };
