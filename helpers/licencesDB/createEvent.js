import { runSQLWithDB } from "../_runSQLByName.js";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
export const createEventWithDB = (database, licenceID, eventDateString, requestSession) => {
    const nowMillis = Date.now();
    runSQLWithDB(database, "insert or ignore into LotteryEvents (" +
        "licenceID, eventDate," +
        " recordCreate_userName, recordCreate_timeMillis," +
        " recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?)", [
        licenceID,
        dateTimeFns.dateStringToInteger(eventDateString),
        requestSession.user.userName,
        nowMillis,
        requestSession.user.userName,
        nowMillis
    ]);
};
