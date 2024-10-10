import { runSQL_hasChanges } from './_runSQL.js';
export default function pokeEvent(licenceID, eventDate, requestUser) {
    return runSQL_hasChanges(`update LotteryEvents
      set recordUpdate_userName = ?,
      recordUpdate_timeMillis = ?
      where licenceID = ? and eventDate = ? and recordDelete_timeMillis is null`, [requestUser.userName, Date.now(), licenceID, eventDate]);
}
