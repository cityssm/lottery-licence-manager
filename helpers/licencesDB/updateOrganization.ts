import { runSQL_hasChanges } from "./_runSQL.js";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";

import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";


export const updateOrganization = (requestBody: llm.Organization, requestSession: expressSession.Session): boolean => {

  return runSQL_hasChanges("update Organizations" +
    " set organizationName = ?," +
    " organizationAddress1 = ?," +
    " organizationAddress2 = ?," +
    " organizationCity = ?," +
    " organizationProvince = ?," +
    " organizationPostalCode = ?," +
    " trustAccountNumber = ?," +
    " fiscalStartDate = ?," +
    " fiscalEndDate = ?," +
    " isEligibleForLicences = ?," +
    " organizationNote = ?," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where organizationID = ?" +
    " and recordDelete_timeMillis is null", [
      requestBody.organizationName,
      requestBody.organizationAddress1,
      requestBody.organizationAddress2,
      requestBody.organizationCity,
      requestBody.organizationProvince,
      requestBody.organizationPostalCode,
      requestBody.trustAccountNumber,
      dateTimeFns.dateStringToInteger(requestBody.fiscalStartDateString),
      dateTimeFns.dateStringToInteger(requestBody.fiscalEndDateString),
      requestBody.isEligibleForLicences,
      requestBody.organizationNote,
      requestSession.user.userName,
      Date.now(),
      requestBody.organizationID
    ]);
};
