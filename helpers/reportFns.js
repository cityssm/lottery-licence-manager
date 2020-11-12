"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLicencesQuery = exports.getOrganizationRemindersQuery = exports.getOrganizationBankRecordsFlatQuery = void 0;
const configFns = require("./configFns");
exports.getOrganizationBankRecordsFlatQuery = (includeOrganizationIDFilter) => {
    const bankRecordTypes = configFns.getProperty("bankRecordTypes");
    const sql = "select b.organizationID, o.organizationName," +
        " b.accountNumber, b.bankingYear, b.bankingMonth" +
        bankRecordTypes.reduce((soFar, bankRecordType) => {
            const bankRecordTypeKey = bankRecordType.bankRecordType;
            return soFar +
                ", max(case when bankRecordType = '" + bankRecordTypeKey + "' then recordDate end) as " + bankRecordTypeKey + "_recordDate" +
                ", max(case when bankRecordType = '" + bankRecordTypeKey + "' then recordIsNA end) as " + bankRecordTypeKey + "_recordIsNA" +
                ", max(case when bankRecordType = '" + bankRecordTypeKey + "' then recordNote end) as " + bankRecordTypeKey + "_recordNote";
        }, "") +
        " from OrganizationBankRecords b" +
        " left join Organizations o on b.organizationID = o.organizationID" +
        " where b.recordDelete_timeMillis is null" +
        (includeOrganizationIDFilter ? " and b.organizationID = ?" : "") +
        " group by b.organizationID, o.organizationName, b.accountNumber, b.bankingYear, b.bankingMonth";
    return sql;
};
exports.getOrganizationRemindersQuery = (includeOrganizationIDFilter) => {
    const reminderCategories = configFns.getProperty("reminderCategories");
    const sql = "select r.organizationID, o.organizationName," +
        " case reminderTypeKey" +
        reminderCategories.reduce((soFarCat, reminderCategory) => {
            return soFarCat +
                reminderCategory.reminderTypes.reduce((soFarType, reminderType) => {
                    return soFarType +
                        " when '" + reminderType.reminderTypeKey + "' then '" + reminderType.reminderType.replace(/'/g, "''") + "'";
                }, "");
        }, "") +
        " else reminderTypeKey end as reminderType," +
        " reminderDate, dismissedDate," +
        " reminderStatus, reminderNote," +
        " r.recordCreate_userName, r.recordCreate_timeMillis, r.recordUpdate_userName, r.recordUpdate_timeMillis" +
        " from OrganizationReminders r" +
        " left join Organizations o on r.organizationID = o.organizationID" +
        " where r.recordDelete_timeMillis is null" +
        (includeOrganizationIDFilter ? " and r.organizationID = ?" : "");
    return sql;
};
exports.getLicencesQuery = (options) => {
    const licenceTypes = configFns.getProperty("licenceTypes");
    const sql = "select" +
        " l.licenceID, l.externalLicenceNumber," +
        " o.organizationID, o.organizationName," +
        " l.applicationDate," +
        " case l.licenceTypeKey" +
        licenceTypes.reduce((soFar, licenceType) => {
            return soFar + " when '" + licenceType.licenceTypeKey + "' then '" + licenceType.licenceType.replace(/'/g, "''") + "'";
        }, "") +
        " else l.licenceTypeKey end as licenceType," +
        " l.startDate, l.endDate, l.startTime, l.endTime," +
        " lo.locationName, lo.locationAddress1," +
        " l.municipality, l.licenceDetails, l.termsConditions," +
        " l.totalPrizeValue, l.licenceFee, l.issueDate," +
        " l.recordCreate_userName, l.recordCreate_timeMillis, l.recordUpdate_userName, l.recordUpdate_timeMillis" +
        " from LotteryLicences l" +
        " left join Locations lo on l.locationID = lo.locationID" +
        " left join Organizations o on l.organizationID = o.organizationID" +
        " where l.recordDelete_timeMillis is null" +
        (options.includeOrganizationIDFilter ? " and l.organizationID = ?" : "") +
        (options.includeLocationIDFilter ? " and l.locationID = ?" : "");
    return sql;
};
