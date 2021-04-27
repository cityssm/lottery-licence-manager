import type { ConfigReportDefinition } from "../../types/configTypes";


export const reports: { [reportName: string]: ConfigReportDefinition } = {

  "remarks-all": {
    sql: "select * from OrganizationRemarks"
  },

  "remarks-byOrganization": {

    sql: "select organizationID, remarkIndex," +
      " remarkDate, remarkTime," +
      " remark, isImportant," +
      " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis" +
      " from OrganizationRemarks" +
      " where recordDelete_timeMillis is null" +
      " and organizationID = ?",

    params: (req) => [req.query.organizationID]
  }
};


export default reports;
