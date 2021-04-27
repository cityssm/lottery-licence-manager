export const reports = {
    "representatives-all": {
        sql: "select * from OrganizationRepresentatives"
    },
    "representatives-byOrganization": {
        sql: "select r.organizationID, o.organizationName," +
            " representativeName, representativeTitle," +
            " representativeAddress1, representativeAddress2, representativeCity, representativeProvince," +
            " representativePostalCode, representativePhoneNumber, representativePhoneNumber2, representativeEmailAddress," +
            " isDefault" +
            " from OrganizationRepresentatives r" +
            " left join Organizations o on r.organizationID = o.organizationID" +
            " where r.organizationID = ?",
        params: (req) => [req.query.organizationID]
    }
};
export default reports;
