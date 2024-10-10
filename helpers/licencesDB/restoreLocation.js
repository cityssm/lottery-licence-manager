import { runSQL_hasChanges } from './_runSQL.js';
export default function restoreLocation(locationID, requestUser) {
    const nowMillis = Date.now();
    return runSQL_hasChanges(`update Locations
      set recordDelete_userName = null,
      recordDelete_timeMillis = null,
      recordUpdate_userName = ?,
      recordUpdate_timeMillis = ?
      where recordDelete_timeMillis is not null
      and locationID = ?`, [requestUser.userName, nowMillis, locationID]);
}
