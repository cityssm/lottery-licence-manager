import { runSQL_hasChanges } from "./_runSQL.js";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
export const updateOrganizationBankRecord = (requestBody, requestSession) => {
    return runSQL_hasChanges("update OrganizationBankRecords" +
        " set recordDate = ?," +
        " recordIsNA = ?," +
        " recordNote = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where organizationID = ?" +
        " and recordIndex = ?" +
        " and recordDelete_timeMillis is null", [
        dateTimeFns.dateStringToInteger(requestBody.recordDateString),
        requestBody.recordIsNA ? 1 : 0,
        requestBody.recordNote,
        requestSession.user.userName,
        Date.now(),
        requestBody.organizationID,
        requestBody.recordIndex
    ]);
};
