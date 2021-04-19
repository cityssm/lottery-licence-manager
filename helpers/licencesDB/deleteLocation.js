import { runSQL_hasChanges } from "./_runSQL.js";
export const deleteLocation = (locationID, reqSession) => {
    return runSQL_hasChanges("update Locations" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where recordDelete_timeMillis is null" +
        " and locationID = ?", [
        reqSession.user.userName,
        Date.now(),
        locationID
    ]);
};
