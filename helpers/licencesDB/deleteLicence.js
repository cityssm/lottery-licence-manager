import sqlite from "better-sqlite3";
import { licencesDB as databasePath } from "../../data/databasePaths.js";
import { resetEventTableStats, resetLicenceTableStats } from "../licencesDB.js";
export const deleteLicence = (licenceID, requestSession) => {
    const database = sqlite(databasePath);
    const nowMillis = Date.now();
    const info = database.prepare("update LotteryLicences" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where licenceID = ?" +
        " and recordDelete_timeMillis is null")
        .run(requestSession.user.userName, nowMillis, licenceID);
    const changeCount = info.changes;
    if (changeCount) {
        database.prepare("update LotteryEvents" +
            " set recordDelete_userName = ?," +
            " recordDelete_timeMillis = ?" +
            " where licenceID = ?" +
            " and recordDelete_timeMillis is null")
            .run(requestSession.user.userName, nowMillis, licenceID);
    }
    database.close();
    resetLicenceTableStats();
    resetEventTableStats();
    return changeCount > 0;
};
