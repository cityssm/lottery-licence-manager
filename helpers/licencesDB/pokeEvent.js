import { runSQL_hasChanges } from "./_runSQL.js";
export const pokeEvent = (licenceID, eventDate, requestSession) => {
    return runSQL_hasChanges("update LotteryEvents" +
        " set recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where licenceID = ?" +
        " and eventDate = ?" +
        " and recordDelete_timeMillis is null", [
        requestSession.user.userName,
        Date.now(),
        licenceID,
        eventDate
    ]);
};
export default pokeEvent;
