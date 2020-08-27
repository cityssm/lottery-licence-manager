"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrganizationBankRecord = exports.updateOrganizationBankRecord = exports.addOrganizationBankRecord = exports.getOrganizationBankRecordStats = exports.getOrganizationBankRecords = exports.deleteOrganizationReminder = exports.dismissOrganizationReminder = exports.updateOrganizationReminder = exports.addOrganizationReminder = exports.getOrganizationReminder = exports.deleteOrganizationRemark = exports.updateOrganizationRemark = exports.addOrganizationRemark = exports.getOrganizationRemark = exports.setDefaultOrganizationRepresentative = exports.deleteOrganizationRepresentative = exports.updateOrganizationRepresentative = exports.addOrganizationRepresentative = exports.getDeletedOrganizations = exports.getInactiveOrganizations = exports.restoreOrganization = exports.deleteOrganization = exports.updateOrganization = exports.createOrganization = void 0;
const licencesDB_1 = require("./licencesDB");
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../data/databasePaths");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
exports.createOrganization = (reqBody, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB);
    const nowMillis = Date.now();
    const info = db.prepare("insert into Organizations (" +
        "organizationName, organizationAddress1, organizationAddress2," +
        " organizationCity, organizationProvince, organizationPostalCode," +
        " organizationNote," +
        " recordCreate_userName, recordCreate_timeMillis," +
        " recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(reqBody.organizationName, reqBody.organizationAddress1, reqBody.organizationAddress2, reqBody.organizationCity, reqBody.organizationProvince, reqBody.organizationPostalCode, "", reqSession.user.userName, nowMillis, reqSession.user.userName, nowMillis);
    db.close();
    return Number(info.lastInsertRowid);
};
exports.updateOrganization = (reqBody, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB);
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
        .run(reqBody.organizationName, reqBody.organizationAddress1, reqBody.organizationAddress2, reqBody.organizationCity, reqBody.organizationProvince, reqBody.organizationPostalCode, reqBody.trustAccountNumber, dateTimeFns.dateStringToInteger(reqBody.fiscalStartDateString), dateTimeFns.dateStringToInteger(reqBody.fiscalEndDateString), reqBody.isEligibleForLicences, reqBody.organizationNote, reqSession.user.userName, nowMillis, reqBody.organizationID);
    db.close();
    return info.changes > 0;
};
exports.deleteOrganization = (organizationID, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB);
    const nowMillis = Date.now();
    const info = db.prepare("update Organizations" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where organizationID = ?" +
        " and recordDelete_timeMillis is null")
        .run(reqSession.user.userName, nowMillis, organizationID);
    db.close();
    return info.changes > 0;
};
exports.restoreOrganization = (organizationID, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB);
    const nowMillis = Date.now();
    const info = db.prepare("update Organizations" +
        " set recordDelete_userName = null," +
        " recordDelete_timeMillis = null," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where organizationID = ?" +
        " and recordDelete_timeMillis is not null")
        .run(reqSession.user.userName, nowMillis, organizationID);
    db.close();
    return info.changes > 0;
};
exports.getInactiveOrganizations = (inactiveYears) => {
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - inactiveYears);
    const cutoffDateInteger = dateTimeFns.dateToInteger(cutoffDate);
    const db = sqlite(databasePaths_1.licencesDB, {
        readonly: true
    });
    const rows = db.prepare("select o.organizationID, o.organizationName," +
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
exports.getDeletedOrganizations = () => {
    const db = sqlite(databasePaths_1.licencesDB, {
        readonly: true
    });
    const organizations = db.prepare("select organizationID, organizationName, recordDelete_timeMillis, recordDelete_userName" +
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
exports.addOrganizationRepresentative = (organizationID, reqBody) => {
    const db = sqlite(databasePaths_1.licencesDB);
    const row = db.prepare("select count(representativeIndex) as indexCount," +
        " ifnull(max(representativeIndex), -1) as maxIndex" +
        " from OrganizationRepresentatives" +
        " where organizationID = ?")
        .get(organizationID);
    const newRepresentativeIndex = row.maxIndex + 1;
    const newIsDefault = (row.indexCount === 0 ? 1 : 0);
    db.prepare("insert into OrganizationRepresentatives (" +
        "organizationID, representativeIndex," +
        " representativeName, representativeTitle," +
        " representativeAddress1, representativeAddress2," +
        " representativeCity, representativeProvince, representativePostalCode," +
        " representativePhoneNumber, representativeEmailAddress," +
        " isDefault)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(organizationID, newRepresentativeIndex, reqBody.representativeName, reqBody.representativeTitle, reqBody.representativeAddress1, reqBody.representativeAddress2, reqBody.representativeCity, reqBody.representativeProvince, reqBody.representativePostalCode, reqBody.representativePhoneNumber, reqBody.representativeEmailAddress, newIsDefault);
    db.close();
    const representativeObj = {
        organizationID,
        representativeIndex: newRepresentativeIndex,
        representativeName: reqBody.representativeName,
        representativeTitle: reqBody.representativeTitle,
        representativeAddress1: reqBody.representativeAddress1,
        representativeAddress2: reqBody.representativeAddress2,
        representativeCity: reqBody.representativeCity,
        representativeProvince: reqBody.representativeProvince,
        representativePostalCode: reqBody.representativePostalCode,
        representativePhoneNumber: reqBody.representativePhoneNumber,
        representativeEmailAddress: reqBody.representativeEmailAddress,
        isDefault: newIsDefault === 1
    };
    return representativeObj;
};
exports.updateOrganizationRepresentative = (organizationID, reqBody) => {
    const db = sqlite(databasePaths_1.licencesDB);
    db.prepare("update OrganizationRepresentatives" +
        " set representativeName = ?," +
        " representativeTitle = ?," +
        " representativeAddress1 = ?," +
        " representativeAddress2 = ?," +
        " representativeCity = ?," +
        " representativeProvince = ?," +
        " representativePostalCode = ?," +
        " representativePhoneNumber = ?," +
        " representativeEmailAddress = ?" +
        " where organizationID = ?" +
        " and representativeIndex = ?")
        .run(reqBody.representativeName, reqBody.representativeTitle, reqBody.representativeAddress1, reqBody.representativeAddress2, reqBody.representativeCity, reqBody.representativeProvince, reqBody.representativePostalCode, reqBody.representativePhoneNumber, reqBody.representativeEmailAddress, organizationID, reqBody.representativeIndex);
    db.close();
    const representativeObj = {
        organizationID,
        representativeIndex: reqBody.representativeIndex,
        representativeName: reqBody.representativeName,
        representativeTitle: reqBody.representativeTitle,
        representativeAddress1: reqBody.representativeAddress1,
        representativeAddress2: reqBody.representativeAddress2,
        representativeCity: reqBody.representativeCity,
        representativeProvince: reqBody.representativeProvince,
        representativePostalCode: reqBody.representativePostalCode,
        representativePhoneNumber: reqBody.representativePhoneNumber,
        representativeEmailAddress: reqBody.representativeEmailAddress,
        isDefault: Number(reqBody.isDefault) > 0
    };
    return representativeObj;
};
exports.deleteOrganizationRepresentative = (organizationID, representativeIndex) => {
    const db = sqlite(databasePaths_1.licencesDB);
    const info = db.prepare("delete from OrganizationRepresentatives" +
        " where organizationID = ?" +
        " and representativeIndex = ?")
        .run(organizationID, representativeIndex);
    db.close();
    return info.changes > 0;
};
exports.setDefaultOrganizationRepresentative = (organizationID, representativeIndex) => {
    const db = sqlite(databasePaths_1.licencesDB);
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
exports.getOrganizationRemark = (organizationID, remarkIndex, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB, {
        readonly: true
    });
    const remark = db.prepare("select" +
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
    remark.canUpdate = licencesDB_1.canUpdateObject(remark, reqSession);
    return remark;
};
exports.addOrganizationRemark = (reqBody, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB);
    const row = db.prepare("select ifnull(max(remarkIndex), -1) as maxIndex" +
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
        .run(reqBody.organizationID, newRemarkIndex, remarkDate, remarkTime, reqBody.remark, 0, reqSession.user.userName, rightNow.getTime(), reqSession.user.userName, rightNow.getTime());
    db.close();
    return newRemarkIndex;
};
exports.updateOrganizationRemark = (reqBody, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB);
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
        .run(dateTimeFns.dateStringToInteger(reqBody.remarkDateString), dateTimeFns.timeStringToInteger(reqBody.remarkTimeString), reqBody.remark, reqBody.isImportant ? 1 : 0, reqSession.user.userName, nowMillis, reqBody.organizationID, reqBody.remarkIndex);
    db.close();
    return info.changes > 0;
};
exports.deleteOrganizationRemark = (organizationID, remarkIndex, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB);
    const nowMillis = Date.now();
    const info = db.prepare("update OrganizationRemarks" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where organizationID = ?" +
        " and remarkIndex = ?" +
        " and recordDelete_timeMillis is null")
        .run(reqSession.user.userName, nowMillis, organizationID, remarkIndex);
    db.close();
    return info.changes > 0;
};
exports.getOrganizationReminder = (organizationID, reminderIndex, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB, {
        readonly: true
    });
    const reminder = db.prepare("select * from OrganizationReminders" +
        " where recordDelete_timeMillis is null" +
        " and organizationID = ?" +
        " and reminderIndex = ?")
        .get(organizationID, reminderIndex);
    db.close();
    if (reminder) {
        reminder.recordType = "reminder";
        reminder.reminderDateString = dateTimeFns.dateIntegerToString(reminder.reminderDate || 0);
        reminder.dismissedDateString = dateTimeFns.dateIntegerToString(reminder.dismissedDate || 0);
        reminder.canUpdate = licencesDB_1.canUpdateObject(reminder, reqSession);
    }
    return reminder;
};
exports.addOrganizationReminder = (reqBody, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB);
    const row = db.prepare("select ifnull(max(reminderIndex), -1) as maxIndex" +
        " from OrganizationReminders" +
        " where organizationID = ?")
        .get(reqBody.organizationID);
    const newReminderIndex = row.maxIndex + 1;
    const nowMillis = Date.now();
    db.prepare("insert into OrganizationReminders" +
        " (organizationID, reminderIndex, reminderTypeKey, reminderDate," +
        " reminderStatus, reminderNote," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(reqBody.organizationID, newReminderIndex, reqBody.reminderTypeKey, (reqBody.reminderDateString === ""
        ? null
        : dateTimeFns.dateStringToInteger(reqBody.reminderDateString)), reqBody.reminderStatus, reqBody.reminderNote, reqSession.user.userName, nowMillis, reqSession.user.userName, nowMillis);
    db.close();
    const reminder = {
        recordType: "reminder",
        canUpdate: true,
        organizationID: parseInt(reqBody.organizationID, 10),
        reminderIndex: newReminderIndex,
        reminderTypeKey: reqBody.reminderTypeKey,
        reminderDate: dateTimeFns.dateStringToInteger(reqBody.reminderDateString),
        reminderDateString: reqBody.reminderDateString,
        dismissedDate: null,
        dismissedDateString: "",
        reminderStatus: reqBody.reminderStatus,
        reminderNote: reqBody.reminderNote,
        recordCreate_userName: reqSession.user.userName,
        recordCreate_timeMillis: nowMillis,
        recordUpdate_userName: reqSession.user.userName,
        recordUpdate_timeMillis: nowMillis
    };
    return reminder;
};
exports.updateOrganizationReminder = (reqBody, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB);
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
        .run(reqBody.reminderTypeKey, (reqBody.reminderDateString === ""
        ? null
        : dateTimeFns.dateStringToInteger(reqBody.reminderDateString)), reqBody.reminderStatus, reqBody.reminderNote, (reqBody.dismissedDateString === ""
        ? null
        : dateTimeFns.dateStringToInteger(reqBody.dismissedDateString)), reqSession.user.userName, nowMillis, reqBody.organizationID, reqBody.reminderIndex);
    db.close();
    return info.changes > 0;
};
exports.dismissOrganizationReminder = (organizationID, reminderIndex, reqSession) => {
    const currentDate = new Date();
    const db = sqlite(databasePaths_1.licencesDB);
    const info = db.prepare("update OrganizationReminders" +
        " set dismissedDate = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where organizationID = ?" +
        " and reminderIndex = ?" +
        " and dismissedDate is null" +
        " and recordDelete_timeMillis is null")
        .run(dateTimeFns.dateToInteger(currentDate), reqSession.user.userName, currentDate.getTime(), organizationID, reminderIndex);
    db.close();
    return info.changes > 0;
};
exports.deleteOrganizationReminder = (organizationID, reminderIndex, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB);
    const info = db.prepare("update OrganizationReminders" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where organizationID = ?" +
        " and reminderIndex = ?" +
        " and recordDelete_timeMillis is null")
        .run(reqSession.user.userName, Date.now(), organizationID, reminderIndex);
    db.close();
    return info.changes > 0;
};
exports.getOrganizationBankRecords = (organizationID, accountNumber, bankingYear) => {
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
exports.getOrganizationBankRecordStats = (organizationID) => {
    const db = sqlite(databasePaths_1.licencesDB, {
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
exports.addOrganizationBankRecord = (reqBody, reqSession) => {
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
    const row = db.prepare("select ifnull(max(recordIndex), -1) as maxIndex" +
        " from OrganizationBankRecords" +
        " where organizationID = ?")
        .get(reqBody.organizationID);
    const newRecordIndex = row.maxIndex + 1;
    const nowMillis = Date.now();
    const info = db.prepare("insert into OrganizationBankRecords" +
        " (organizationID, recordIndex," +
        " accountNumber, bankingYear, bankingMonth, bankRecordType, recordIsNA, recordDate, recordNote," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(reqBody.organizationID, newRecordIndex, reqBody.accountNumber, reqBody.bankingYear, reqBody.bankingMonth, reqBody.bankRecordType, reqBody.recordIsNA || 0, dateTimeFns.dateStringToInteger(reqBody.recordDateString), reqBody.recordNote, reqSession.user.userName, nowMillis, reqSession.user.userName, nowMillis);
    db.close();
    return info.changes > 0;
};
exports.updateOrganizationBankRecord = (reqBody, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB);
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
        .run(dateTimeFns.dateStringToInteger(reqBody.recordDateString), reqBody.recordIsNA || 0, reqBody.recordNote, reqSession.user.userName, nowMillis, reqBody.organizationID, reqBody.recordIndex);
    db.close();
    return info.changes > 0;
};
exports.deleteOrganizationBankRecord = (organizationID, recordIndex, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB);
    const nowMillis = Date.now();
    const info = db.prepare("update OrganizationBankRecords" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where organizationID = ?" +
        " and recordIndex = ?" +
        " and recordDelete_timeMillis is null")
        .run(reqSession.user.userName, nowMillis, organizationID, recordIndex);
    db.close();
    return info.changes > 0;
};
