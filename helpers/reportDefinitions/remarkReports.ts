import type { ConfigReportDefinition } from "../../types/configTypes";


export const reports: { [reportName: string]: ConfigReportDefinition } = {

  "remarks-all": {
    sql: "select * from OrganizationRemarks"
  },

  "remarks-formatted": {

    sql: "select o.organizationName," +
      " remarkDate, remarkTime," +
      " remark, isImportant" +
      " from OrganizationRemarks r" +
      " left join Organizations o on r.organizationID = o.organizationID" +
      " where r.recordDelete_timeMillis is null" +
      " and o.recordDelete_timeMillis is null"
  },

  "remarks-byOrganization": {

    sql: "select o.organizationName," +
      " remarkDate, remarkTime," +
      " remark, isImportant" +
      " from OrganizationRemarks r" +
      " left join Organizations o on r.organizationID = o.organizationID" +
      " where r.recordDelete_timeMillis is null" +
      " and r.organizationID = ?",

    params: (req) => [req.query.organizationID]
  }
};


export default reports;
