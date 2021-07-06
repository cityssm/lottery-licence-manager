import * as configFns from "../configFns.js";

import type { ConfigReportDefinition } from "../../types/configTypes";


const sql_bankRecordsFlatByBankingYear = (() => {

  const bankRecordTypes = configFns.getProperty("bankRecordTypes");

  const sql = "select o.organizationName," +
    " r1.accountNumber, m.bankingYear, m.bankingMonth" +
    bankRecordTypes.reduce((soFar, bankRecordType) => {

      const bankRecordTypeKey = bankRecordType.bankRecordType;

      return soFar +
        ", max(case" +
        " when r2.bankRecordType = '" + bankRecordTypeKey + "' and r2.recordIsNA = 1 then 'Not Applicable'" +
        " when r2.bankRecordType = '" + bankRecordTypeKey + "' and r2.recordDate is not null then 'Received'" +
        " else '' end) as " + bankRecordTypeKey + "_status" +
        // ", max(case when bankRecordType = '" + bankRecordTypeKey + "' then recordDate end) as " + bankRecordTypeKey + "_recordDate" +
        // ", max(case when bankRecordType = '" + bankRecordTypeKey + "' then recordIsNA end) as " + bankRecordTypeKey + "_recordIsNA" +
        ", max(case when r2.bankRecordType = '" + bankRecordTypeKey + "' then r2.recordNote end) as " + bankRecordTypeKey + "_recordNote";

    }, "") +

    " from (select ? as bankingYear, bankingMonth from BankingMonths) as m" +
    " left join (select distinct organizationID, accountNumber, bankingYear from OrganizationBankRecords) r1 on m.bankingYear = r1.bankingYear" +
    " left join OrganizationBankRecords r2" +
      " on r1.organizationID = r2.organizationID and r1.accountNumber = r2.accountNumber" +
      " and m.bankingYear = r2.bankingYear and m.bankingMonth = r2.bankingMonth" +

    " left join Organizations o on r1.organizationID = o.organizationID" +
    " where r2.recordDelete_timeMillis is null" +
    " and o.recordDelete_timeMillis is null" +
    " group by o.organizationName, r1.accountNumber, m.bankingYear, m.bankingMonth";

  return sql;
})();


const sql_bankRecordsFlatByOrganizationAndBankingYear = (() => {

  const bankRecordTypes = configFns.getProperty("bankRecordTypes");

  const sql = "select o.organizationName," +
    " r1.accountNumber, m.bankingYear, m.bankingMonth" +
    bankRecordTypes.reduce((soFar, bankRecordType) => {

      const bankRecordTypeKey = bankRecordType.bankRecordType;

      return soFar +
        ", max(case" +
        " when r2.bankRecordType = '" + bankRecordTypeKey + "' and r2.recordIsNA = 1 then 'Not Applicable'" +
        " when r2.bankRecordType = '" + bankRecordTypeKey + "' and r2.recordDate is not null then 'Received'" +
        " else '' end) as " + bankRecordTypeKey + "_status" +
        ", max(case when bankRecordType = '" + bankRecordTypeKey + "' then recordDate end) as " + bankRecordTypeKey + "_recordDate" +
        // ", max(case when bankRecordType = '" + bankRecordTypeKey + "' then recordIsNA end) as " + bankRecordTypeKey + "_recordIsNA" +
        ", max(case when r2.bankRecordType = '" + bankRecordTypeKey + "' then r2.recordNote end) as " + bankRecordTypeKey + "_recordNote";

    }, "") +

    // " from OrganizationBankRecords b" +
    " from (select ? as bankingYear, bankingMonth from BankingMonths) as m" +
    " left join (select distinct organizationID, accountNumber, bankingYear from OrganizationBankRecords) r1 on m.bankingYear = r1.bankingYear" +
    " left join OrganizationBankRecords r2" +
      " on r1.organizationID = r2.organizationID and r1.accountNumber = r2.accountNumber" +
      " and m.bankingYear = r2.bankingYear and m.bankingMonth = r2.bankingMonth" +

    " left join Organizations o on r1.organizationID = o.organizationID" +
    " where r2.recordDelete_timeMillis is null" +
    " and r1.organizationID = ?" +
    " group by o.organizationName, r1.accountNumber, m.bankingYear, m.bankingMonth";

  return sql;
})();


export const reports: { [reportName: string]: ConfigReportDefinition } = {

  "bankRecords-all": {
    sql: "select * from OrganizationBankRecords"
  },

  "bankRecordsFlat-byBankingYear": {
    sql: sql_bankRecordsFlatByBankingYear,
    params: (request) => [request.query.bankingYear]
  },

  "bankRecordsFlat-byOrganizationAndBankingYear": {
    sql: sql_bankRecordsFlatByOrganizationAndBankingYear,
    params: (request) => [request.query.bankingYear, request.query.organizationID]
  }
};


export default reports;
