export function getMaxOrganizationRemarkIndexWithDB(database, organizationID) {
    const result = database
        .prepare(`select remarkIndex
        from OrganizationRemarks
        where organizationID = ?
        order by remarkIndex desc
        limit 1`)
        .get(organizationID);
    return result === undefined ? -1 : result.remarkIndex;
}
