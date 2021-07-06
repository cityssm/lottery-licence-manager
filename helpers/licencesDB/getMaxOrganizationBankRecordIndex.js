export const getMaxOrganizationBankRecordIndexWithDB = (database, organizationID) => {
    const result = database.prepare("select recordIndex" +
        " from OrganizationBankRecords" +
        " where organizationID = ?" +
        " order by recordIndex desc" +
        " limit 1")
        .get(organizationID);
    return (result
        ? result.recordIndex
        : -1);
};
