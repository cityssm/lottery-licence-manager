import { runSQL_hasChanges } from "./_runSQL.js";

import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";


export const updateLocation = (reqBody: llm.Location, reqSession: expressSession.Session): boolean => {

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
      reqBody.locationName,
      reqBody.locationAddress1,
      reqBody.locationAddress2,
      reqBody.locationCity,
      reqBody.locationProvince,
      reqBody.locationPostalCode,
      reqBody.locationIsDistributor ? 1 : 0,
      reqBody.locationIsManufacturer ? 1 : 0,
      reqSession.user.userName,
      Date.now(),
      reqBody.locationID
    ]);
};
