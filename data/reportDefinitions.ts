import type { ConfigReportDefinition } from "../types/configTypes";


export const reportDefinitions: { [reportName: string]: ConfigReportDefinition } = {
  "locations-all": {
    sql: "select * from Locations"
  },

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
  },

  "representatives-all": {
    sql: "select * from OrganizationRepresentatives"
  },

  "remarks-all": {
    sql: "select * from OrganizationRemarks"
  },

  "reminders-all": {
    sql: "select * from OrganizationReminders"
  },

  "bankRecords-all": {
    sql: "select * from OrganizationBankRecords"
  },

  "licences-all": {
    sql: "select * from LotteryLicences"
  },

  "licences-notIssued": {
    sql: "select l.licenceID, l.externalLicenceNumber, l.applicationDate," +
      " o.organizationID, o.organizationName," +
      " l.licenceTypeKey," +
      " l.startDate, l.endDate, l.startTime, l.endTime," +
      " lo.locationName, lo.locationAddress1," +
      " l.municipality," +
      " l.licenceDetails, l.termsConditions, l.totalPrizeValue," +
      " l.recordUpdate_userName, l.recordUpdate_timeMillis" +
      " from LotteryLicences l" +
      " left join Locations lo on l.locationID = lo.locationID" +
      " left join Organizations o on l.organizationID = o.organizationID" +
      " where l.recordDelete_timeMillis is null" +
      " and l.issueDate is null"
  },

  "amendments-all": {
    sql: "select * from LotteryLicenceAmendments"
  },

  "transactions-all": {
    sql: "select * from LotteryLicenceTransactions"
  },

  "events-all": {
    sql: "select * from LotteryEvents"
  }
};


export default reportDefinitions;
