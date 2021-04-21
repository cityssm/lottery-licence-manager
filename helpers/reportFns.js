import * as configFns from "./configFns.js";
export const getOrganizationBankRecordsFlatQuery = (includeOrganizationIDFilter) => {
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
export const getOrganizationRemindersQuery = (includeOrganizationIDFilter) => {
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
export const userFn_licenceTypeKeyToLicenceType = (licenceTypeKey) => {
    const licenceTypeDef = configFns.getLicenceType(licenceTypeKey);
    return (licenceTypeDef
        ? licenceTypeDef.licenceType
        : null);
};
