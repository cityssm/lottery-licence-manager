import { formatPhoneNumber } from "@cityssm/expressjs-server-js/stringFns.js";

import type { ConfigReportDefinition } from "../../types/configTypes";


const baseFunctions = (): Map<string, () => unknown> => {
  const functions = new Map();
  functions.set("userFn_formatPhoneNumber", formatPhoneNumber);
  return functions;
};


export const reports: { [reportName: string]: ConfigReportDefinition } = {

  "representatives-all": {
    sql: "select * from OrganizationRepresentatives"
  },

  "representatives-formatted": {
    sql: "select o.organizationName," +
      " o.fiscalStartDate, o.fiscalEndDate," +
      " representativeName, representativeTitle," +
      " representativeAddress1, representativeAddress2, representativeCity, representativeProvince," +
      " representativePostalCode," +
      " userFn_formatPhoneNumber(r.representativePhoneNumber) as representativePhoneNumberFormatted," +
      " userFn_formatPhoneNumber(r.representativePhoneNumber2) as representativePhoneNumber2Formatted," +
      " representativeEmailAddress" +
      " from OrganizationRepresentatives r" +
      " left join Organizations o on r.organizationID = o.organizationID" +
      " where o.recordDelete_timeMillis is null" +
      " order by organizationName, representativeName",
    functions: baseFunctions
  },

  "representatives-byOrganization": {
    sql: "select o.organizationName," +
      " representativeName, representativeTitle," +
      " representativeAddress1, representativeAddress2, representativeCity, representativeProvince," +
      " representativePostalCode," +
      " userFn_formatPhoneNumber(r.representativePhoneNumber) as representativePhoneNumberFormatted," +
      " userFn_formatPhoneNumber(r.representativePhoneNumber2) as representativePhoneNumber2Formatted," +

      " representativeEmailAddress," +
      " isDefault" +
      " from OrganizationRepresentatives r" +
      " left join Organizations o on r.organizationID = o.organizationID" +
      " where r.organizationID = ?" +
      " order by representativeName",

    params: (request) => [request.query.organizationID],
    functions: baseFunctions
  }
};


export default reports;
