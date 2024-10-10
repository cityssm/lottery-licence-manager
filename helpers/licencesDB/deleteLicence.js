import sqlite from 'better-sqlite3';
import { licencesDB as databasePath } from '../../data/databasePaths.js';
import { resetEventTableStats, resetLicenceTableStats } from '../licencesDB.js';
export default function deleteLicence(licenceID, requestUser) {
    const database = sqlite(databasePath);
    const nowMillis = Date.now();
    const info = database
        .prepare(`update LotteryLicences
        set recordDelete_userName = ?,
          recordDelete_timeMillis = ?
        where licenceID = ?
          and recordDelete_timeMillis is null`)
        .run(requestUser.userName, nowMillis, licenceID);
    const changeCount = info.changes;
    if (changeCount > 0) {
        database
            .prepare(`update LotteryEvents
          set recordDelete_userName = ?,
          recordDelete_timeMillis = ?
          where licenceID = ?
          and recordDelete_timeMillis is null`)
            .run(requestUser.userName, nowMillis, licenceID);
    }
    database.close();
    resetLicenceTableStats();
    resetEventTableStats();
    return changeCount > 0;
}
