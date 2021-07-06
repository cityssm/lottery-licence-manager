import { runSQL_hasChanges } from "./_runSQL.js";
export const deleteOrganization = (organizationID, requestSession) => {
    return runSQL_hasChanges("update Organizations" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where organizationID = ?" +
        " and recordDelete_timeMillis is null", [
        requestSession.user.userName,
        Date.now(),
        organizationID
    ]);
};
