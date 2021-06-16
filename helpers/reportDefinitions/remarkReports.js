export const reports = {
    "remarks-all": {
        sql: "select * from OrganizationRemarks"
    },
    "remarks-formatted": {
        sql: "select o.organizationName," +
            " remarkDate, remarkTime," +
            " remark" +
            " from OrganizationRemarks r" +
            " left join Organizations o on r.organizationID = o.organizationID" +
            " where r.recordDelete_timeMillis is null" +
            " and o.recordDelete_timeMillis is null" +
            " order by o.organizationName, remarkDate, remarkTime, remarkIndex"
    },
    "remarks-byOrganization": {
        sql: "select o.organizationName," +
            " remarkDate, remarkTime," +
            " remark, isImportant" +
            " from OrganizationRemarks r" +
            " left join Organizations o on r.organizationID = o.organizationID" +
            " where r.recordDelete_timeMillis is null" +
            " and r.organizationID = ?" +
            " order by remarkDate, remarkTime, remarkIndex",
        params: (req) => [req.query.organizationID]
    }
};
export default reports;
