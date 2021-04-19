import { runSQL_hasChanges } from "./_runSQL.js";
export const deleteOrganizationRemark = (organizationID, remarkIndex, reqSession) => {
    return runSQL_hasChanges("update OrganizationRemarks" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where organizationID = ?" +
        " and remarkIndex = ?" +
        " and recordDelete_timeMillis is null", [
        reqSession.user.userName,
        Date.now(),
        organizationID,
        remarkIndex
    ]);
};
