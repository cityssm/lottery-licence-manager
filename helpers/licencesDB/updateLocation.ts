import { runSQL_hasChanges } from "./_runSQL.js";

import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";


export const updateLocation = (requestBody: llm.Location, requestSession: expressSession.Session): boolean => {

  return runSQL_hasChanges("update Locations" +
    " set locationName = ?," +
    " locationAddress1 = ?," +
    " locationAddress2 = ?," +
    " locationCity = ?," +
    " locationProvince = ?," +
    " locationPostalCode = ?," +
    " locationIsDistributor = ?," +
    " locationIsManufacturer = ?," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where recordDelete_timeMillis is null" +
    " and locationID = ?", [
      requestBody.locationName,
      requestBody.locationAddress1,
      requestBody.locationAddress2,
      requestBody.locationCity,
      requestBody.locationProvince,
      requestBody.locationPostalCode,
      requestBody.locationIsDistributor ? 1 : 0,
      requestBody.locationIsManufacturer ? 1 : 0,
      requestSession.user.userName,
      Date.now(),
      requestBody.locationID
    ]);
};
