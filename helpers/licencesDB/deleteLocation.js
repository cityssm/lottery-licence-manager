import { runSQL_hasChanges } from './_runSQL.js';
export default function deleteLocation(locationID, requestUser) {
    return runSQL_hasChanges(`update Locations
      set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
      where recordDelete_timeMillis is null
        and locationID = ?`, [requestUser.userName, Date.now(), locationID]);
}
