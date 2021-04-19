import { runSQLWithDB } from "../_runSQLByName.js";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
export const createEventWithDB = (db, licenceID, eventDateString, reqSession) => {
    const nowMillis = Date.now();
    runSQLWithDB(db, "insert or ignore into LotteryEvents (" +
        "licenceID, eventDate," +
        " recordCreate_userName, recordCreate_timeMillis," +
        " recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?)", [
        licenceID,
        dateTimeFns.dateStringToInteger(eventDateString),
        reqSession.user.userName,
        nowMillis,
        reqSession.user.userName,
        nowMillis
    ]);
};
