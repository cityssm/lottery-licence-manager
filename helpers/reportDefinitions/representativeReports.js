export const reports = {
    "representatives-all": {
        sql: "select * from OrganizationRepresentatives"
    },
    "representatives-formatted": {
        sql: "select o.organizationName," +
            " representativeName, representativeTitle," +
            " representativeAddress1, representativeAddress2, representativeCity, representativeProvince," +
            " representativePostalCode, representativePhoneNumber, representativePhoneNumber2, representativeEmailAddress" +
            " from OrganizationRepresentatives r" +
            " left join Organizations o on r.organizationID = o.organizationID" +
            " where o.recordDelete_timeMillis is null" +
            " order by organizationName, representativeName"
    },
    "representatives-byOrganization": {
        sql: "select o.organizationName," +
            " representativeName, representativeTitle," +
            " representativeAddress1, representativeAddress2, representativeCity, representativeProvince," +
            " representativePostalCode, representativePhoneNumber, representativePhoneNumber2, representativeEmailAddress," +
            " isDefault" +
            " from OrganizationRepresentatives r" +
            " left join Organizations o on r.organizationID = o.organizationID" +
            " where r.organizationID = ?" +
            " order by representativeName",
        params: (request) => [request.query.organizationID]
    }
};
export default reports;
