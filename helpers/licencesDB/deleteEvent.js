import { runSQL } from "./_runSQL.js";
import * as licencesDB from "../licencesDB.js";
export const deleteEvent = (licenceID, eventDate, reqSession) => {
    const nowMillis = Date.now();
    const result = runSQL("update LotteryEvents" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where licenceID = ?" +
        " and eventDate = ?" +
        " and recordDelete_timeMillis is null", [
        reqSession.user.userName,
        nowMillis,
        licenceID,
        eventDate
    ]);
    const changeCount = result.changes;
    licencesDB.resetEventTableStats();
    return changeCount > 0;
};
