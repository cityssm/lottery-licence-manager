"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrganizationBankRecordStats = exports.getOrganizationBankRecords = exports.setDefaultOrganizationRepresentative = exports.deleteOrganizationRepresentative = exports.getDeletedOrganizations = exports.getInactiveOrganizations = exports.restoreOrganization = exports.deleteOrganization = exports.updateOrganization = exports.createOrganization = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../data/databasePaths");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const createOrganization = (reqBody, reqSession) => {
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
exports.createOrganization = createOrganization;
const updateOrganization = (reqBody, reqSession) => {
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
exports.updateOrganization = updateOrganization;
const deleteOrganization = (organizationID, reqSession) => {
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
exports.deleteOrganization = deleteOrganization;
const restoreOrganization = (organizationID, reqSession) => {
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
exports.restoreOrganization = restoreOrganization;
const getInactiveOrganizations = (inactiveYears) => {
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
exports.getInactiveOrganizations = getInactiveOrganizations;
const getDeletedOrganizations = () => {
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
exports.getDeletedOrganizations = getDeletedOrganizations;
const deleteOrganizationRepresentative = (organizationID, representativeIndex) => {
    const db = sqlite(databasePaths_1.licencesDB);
    const info = db.prepare("delete from OrganizationRepresentatives" +
        " where organizationID = ?" +
        " and representativeIndex = ?")
        .run(organizationID, representativeIndex);
    db.close();
    return info.changes > 0;
};
exports.deleteOrganizationRepresentative = deleteOrganizationRepresentative;
const setDefaultOrganizationRepresentative = (organizationID, representativeIndex) => {
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
exports.setDefaultOrganizationRepresentative = setDefaultOrganizationRepresentative;
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
const getOrganizationBankRecordStats = (organizationID) => {
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
exports.getOrganizationBankRecordStats = getOrganizationBankRecordStats;
