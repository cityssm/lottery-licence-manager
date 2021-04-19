import { runSQL_hasChanges } from "./_runSQL.js";
export const pokeLicence = (licenceID, reqSession) => {
    return runSQL_hasChanges("update LotteryLicences" +
        " set recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where licenceID = ?" +
        " and recordDelete_timeMillis is null", [
        reqSession.user.userName,
        Date.now(),
        licenceID
    ]);
};
