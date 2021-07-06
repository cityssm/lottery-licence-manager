import { runSQL_hasChanges } from "./_runSQL.js";
export const deleteOrganizationRemark = (organizationID, remarkIndex, requestSession) => {
    return runSQL_hasChanges("update OrganizationRemarks" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where organizationID = ?" +
        " and remarkIndex = ?" +
        " and recordDelete_timeMillis is null", [
        requestSession.user.userName,
        Date.now(),
        organizationID,
        remarkIndex
    ]);
};
