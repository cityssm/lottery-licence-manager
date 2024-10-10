import { runSQL_hasChanges } from './_runSQL.js';
export default function updateLocation(requestBody, requestUser) {
    return runSQL_hasChanges(`update Locations
      set locationName = ?,
      locationAddress1 = ?,
      locationAddress2 = ?,
      locationCity = ?,
      locationProvince = ?,
      locationPostalCode = ?,
      locationIsDistributor = ?,
      locationIsManufacturer = ?,
      recordUpdate_userName = ?,
      recordUpdate_timeMillis = ?
      where recordDelete_timeMillis is null
      and locationID = ?`, [
        requestBody.locationName,
        requestBody.locationAddress1,
        requestBody.locationAddress2,
        requestBody.locationCity,
        requestBody.locationProvince,
        requestBody.locationPostalCode,
        requestBody.locationIsDistributor ? 1 : 0,
        requestBody.locationIsManufacturer ? 1 : 0,
        requestUser.userName,
        Date.now(),
        requestBody.locationID
    ]);
}
