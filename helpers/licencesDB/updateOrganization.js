import { runSQL_hasChanges } from "./_runSQL.js";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
export const updateOrganization = (reqBody, reqSession) => {
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
