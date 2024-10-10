export function getMaxOrganizationBankRecordIndexWithDB(database, organizationID) {
    const result = database
        .prepare('select recordIndex' +
        ' from OrganizationBankRecords' +
        ' where organizationID = ?' +
        ' order by recordIndex desc' +
        ' limit 1')
        .get(organizationID);
    return result === undefined ? -1 : result.recordIndex;
}
