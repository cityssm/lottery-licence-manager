export const getMaxOrganizationRemarkIndexWithDB = (database, organizationID) => {
    const result = database.prepare("select remarkIndex" +
        " from OrganizationRemarks" +
        " where organizationID = ?" +
        " order by remarkIndex desc" +
        " limit 1")
        .get(organizationID);
    return (result
        ? result.remarkIndex
        : -1);
};
