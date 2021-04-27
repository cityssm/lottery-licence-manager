import * as configFns from "../configFns.js";

import type { ConfigReportDefinition } from "../../types/configTypes";


const sql_bankRecordsFlatByOrganization = (() => {

  const bankRecordTypes = configFns.getProperty("bankRecordTypes");

  const sql = "select b.organizationID, o.organizationName," +
    " b.accountNumber, b.bankingYear, b.bankingMonth" +
    bankRecordTypes.reduce((soFar, bankRecordType) => {

      const bankRecordTypeKey = bankRecordType.bankRecordType;

      return soFar +
        ", max(case when bankRecordType = '" + bankRecordTypeKey + "' then recordDate end) as " + bankRecordTypeKey + "_recordDate" +
        ", max(case when bankRecordType = '" + bankRecordTypeKey + "' then recordIsNA end) as " + bankRecordTypeKey + "_recordIsNA" +
        ", max(case when bankRecordType = '" + bankRecordTypeKey + "' then recordNote end) as " + bankRecordTypeKey + "_recordNote";

    }, "") +
    " from OrganizationBankRecords b" +
    " left join Organizations o on b.organizationID = o.organizationID" +
    " where b.recordDelete_timeMillis is null" +
    " and b.organizationID = ?" +
    " group by b.organizationID, o.organizationName, b.accountNumber, b.bankingYear, b.bankingMonth";

  return sql;
})();


export const reports: { [reportName: string]: ConfigReportDefinition } = {

  "bankRecords-all": {
    sql: "select * from OrganizationBankRecords"
  },

  "bankRecordsFlat-byOrganization": {

    sql: sql_bankRecordsFlatByOrganization,

    params: (req) => [req.query.organizationID]
  }
};


export default reports;
