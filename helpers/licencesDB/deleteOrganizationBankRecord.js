import { runSQL_hasChanges } from "./_runSQL.js";
export const deleteOrganizationBankRecord = (organizationID, recordIndex, reqSession) => {
    return runSQL_hasChanges("update OrganizationBankRecords" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where organizationID = ?" +
        " and recordIndex = ?" +
        " and recordDelete_timeMillis is null", [
        reqSession.user.userName,
        Date.now(),
        organizationID,
        recordIndex
    ]);
};
