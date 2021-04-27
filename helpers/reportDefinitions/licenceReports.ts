import * as reportFns from "../reportFns.js";

import type { ConfigReportDefinition } from "../../types/configTypes";


export const reports: { [reportName: string]: ConfigReportDefinition } = {

  "licences-all": {
    sql: "select * from LotteryLicences"
  },

  "licences-notIssued": {

    functions: () => {

      const func = new Map<string, (...params: any[]) => any>();

      func.set("userFn_licenceTypeKeyToLicenceType", reportFns.userFn_licenceTypeKeyToLicenceType);

      return func;
    },

    sql: "select l.licenceID, l.externalLicenceNumber, l.applicationDate," +
      " o.organizationID, o.organizationName," +
      " userFn_licenceTypeKeyToLicenceType(l.licenceTypeKey) as licenceType," +
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

  "licences-formatted": {

    functions: () => {
      const func = new Map();
      func.set("userFn_licenceTypeKeyToLicenceType", reportFns.userFn_licenceTypeKeyToLicenceType);
      return func;
    },

    sql: "select" +
      " l.licenceID, l.externalLicenceNumber," +
      " o.organizationID, o.organizationName," +
      " l.applicationDate," +
      " userFn_licenceTypeKeyToLicenceType(l.licenceTypeKey) as licenceType," +
      " l.startDate, l.endDate, l.startTime, l.endTime," +
      " lo.locationName, lo.locationAddress1," +
      " l.municipality, l.licenceDetails, l.termsConditions," +
      " l.totalPrizeValue, l.licenceFee, l.issueDate," +
      " l.recordCreate_userName, l.recordCreate_timeMillis, l.recordUpdate_userName, l.recordUpdate_timeMillis" +
      " from LotteryLicences l" +
      " left join Locations lo on l.locationID = lo.locationID" +
      " left join Organizations o on l.organizationID = o.organizationID" +
      " where l.recordDelete_timeMillis is null"
  },

  "licences-byOrganization": {

    functions: () => {
      const func = new Map();
      func.set("userFn_licenceTypeKeyToLicenceType", reportFns.userFn_licenceTypeKeyToLicenceType);
      return func;
    },

    sql: "select" +
      " l.licenceID, l.externalLicenceNumber," +
      " o.organizationID, o.organizationName," +
      " l.applicationDate," +
      " userFn_licenceTypeKeyToLicenceType(l.licenceTypeKey) as licenceType," +
      " l.startDate, l.endDate, l.startTime, l.endTime," +
      " lo.locationName, lo.locationAddress1," +
      " l.municipality, l.licenceDetails, l.termsConditions," +
      " l.totalPrizeValue, l.licenceFee, l.issueDate," +
      " l.recordCreate_userName, l.recordCreate_timeMillis, l.recordUpdate_userName, l.recordUpdate_timeMillis" +
      " from LotteryLicences l" +
      " left join Locations lo on l.locationID = lo.locationID" +
      " left join Organizations o on l.organizationID = o.organizationID" +
      " where l.recordDelete_timeMillis is null" +
      " and l.organizationID = ?",

    params: (req) => [req.query.organizationID]
  },

  "licences-byLocation": {

    functions: () => {
      const func = new Map();
      func.set("userFn_licenceTypeKeyToLicenceType", reportFns.userFn_licenceTypeKeyToLicenceType);
      return func;
    },

    sql: "select" +
      " l.licenceID, l.externalLicenceNumber," +
      " o.organizationID, o.organizationName," +
      " l.applicationDate," +
      " userFn_licenceTypeKeyToLicenceType(l.licenceTypeKey) as licenceType," +
      " l.startDate, l.endDate, l.startTime, l.endTime," +
      " lo.locationName, lo.locationAddress1," +
      " l.municipality, l.licenceDetails, l.termsConditions," +
      " l.totalPrizeValue, l.licenceFee, l.issueDate," +
      " l.recordCreate_userName, l.recordCreate_timeMillis, l.recordUpdate_userName, l.recordUpdate_timeMillis" +
      " from LotteryLicences l" +
      " left join Locations lo on l.locationID = lo.locationID" +
      " left join Organizations o on l.organizationID = o.organizationID" +
      " where l.recordDelete_timeMillis is null" +
      " and l.locationID = ?",

    params: (req) => [req.query.locationID]
  }
};


export default reports;
