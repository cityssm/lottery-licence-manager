import { runSQL_hasChanges } from "./_runSQL.js";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";

import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";


export const updateOrganization = (reqBody: llm.Organization, reqSession: expressSession.Session): boolean => {

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
      reqBody.organizationName,
      reqBody.organizationAddress1,
      reqBody.organizationAddress2,
      reqBody.organizationCity,
      reqBody.organizationProvince,
      reqBody.organizationPostalCode,
      reqBody.trustAccountNumber,
      dateTimeFns.dateStringToInteger(reqBody.fiscalStartDateString),
      dateTimeFns.dateStringToInteger(reqBody.fiscalEndDateString),
      reqBody.isEligibleForLicences,
      reqBody.organizationNote,
      reqSession.user.userName,
      Date.now(),
      reqBody.organizationID
    ]);
};
