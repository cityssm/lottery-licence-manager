import * as licencesDB from '../licencesDB.js';
import { runSQL } from './_runSQL.js';
export default function deleteEvent(licenceID, eventDate, requestUser) {
    const nowMillis = Date.now();
    const result = runSQL(`update LotteryEvents
      set recordDelete_userName = ?,
      recordDelete_timeMillis = ?
      where licenceID = ?
      and eventDate = ?
      and recordDelete_timeMillis is null`, [requestUser.userName, nowMillis, licenceID, eventDate]);
    const changeCount = result === undefined ? 0 : result.changes;
    licencesDB.resetEventTableStats();
    return changeCount > 0;
}
