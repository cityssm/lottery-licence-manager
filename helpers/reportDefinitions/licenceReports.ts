import * as reportFns from "../functions.report.js";

import type { ConfigReportDefinition } from "../../types/configTypes";


const baseFunctions = (): Map<string, () => unknown> => {
  const functions = new Map();
  functions.set("userFn_licenceTypeKeyToLicenceType", reportFns.userFn_licenceTypeKeyToLicenceType);
  return functions;
};


const baseSQL = "select" +
  " l.licenceID, l.externalLicenceNumber," +
  " o.organizationName," +
  " l.applicationDate," +
  " userFn_licenceTypeKeyToLicenceType(l.licenceTypeKey) as licenceType," +
  " l.startDate, l.endDate, l.startTime, l.endTime," +
  " lo.locationName, lo.locationAddress1," +
  " l.municipality, l.licenceDetails, l.termsConditions," +
  " l.totalPrizeValue, l.licenceFee, l.issueDate" +
  " from LotteryLicences l" +
  " left join Locations lo on l.locationID = lo.locationID" +
  " left join Organizations o on l.organizationID = o.organizationID" +
  " where l.recordDelete_timeMillis is null";


export const reports: { [reportName: string]: ConfigReportDefinition } = {

  "licences-all": {
    sql: "select * from LotteryLicences"
  },

  "licences-notIssued": {
    functions: baseFunctions,
    sql: baseSQL + " and l.issueDate is null"
  },

  "licences-formatted": {
    functions: baseFunctions,
    sql: baseSQL
  },

  "licences-byOrganization": {
    functions: baseFunctions,
    sql: baseSQL + " and l.organizationID = ?",
    params: (request) => [request.query.organizationID]
  },

  "licences-byLocation": {
    functions: baseFunctions,
    sql: baseSQL + " and l.locationID = ?",
    params: (request) => [request.query.locationID]
  }
};


export default reports;
