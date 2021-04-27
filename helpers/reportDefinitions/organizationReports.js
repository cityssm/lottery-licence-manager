export const reports = {
    "organizations-all": {
        sql: "select * from Organizations"
    },
    "organizations-withDefaultRepresentatives": {
        sql: "select o.organizationID, o.organizationName, o.organizationAddress1, o.organizationAddress2," +
            " o.organizationCity, o.organizationProvince, o.organizationPostalCode," +
            " r.representativeName, r.representativeTitle, r.representativeAddress1, r.representativeAddress2," +
            " r.representativeCity, r.representativeProvince, r.representativePostalCode," +
            " r.representativePhoneNumber, r.representativeEmailAddress," +
            " o.recordUpdate_userName, o.recordUpdate_timeMillis" +
            " from Organizations o" +
            " left join OrganizationRepresentatives r on o.organizationID = r.organizationID and r.isDefault = 1" +
            " where o.recordDelete_timeMillis is null" +
            " and o.isEligibleForLicences = 1"
    },
    "organizations-ineligible": {
        sql: "select o.organizationID, o.organizationName, o.organizationAddress1, o.organizationAddress2," +
            " o.organizationCity, o.organizationProvince, o.organizationPostalCode, o.organizationNote," +
            " o.recordDelete_userName, o.recordDelete_timeMillis" +
            " from Organizations o" +
            " where o.recordDelete_timeMillis is null" +
            " and o.isEligibleForLicences = 0"
    },
    "organizations-deleted": {
        sql: "select o.organizationID, o.organizationName, o.organizationAddress1, o.organizationAddress2," +
            " o.organizationCity, o.organizationProvince, o.organizationPostalCode," +
            " o.isEligibleForLicences, o.organizationNote," +
            " o.recordDelete_userName, o.recordDelete_timeMillis" +
            " from Organizations o" +
            " where o.recordDelete_timeMillis is not null"
    }
};
export default reports;
