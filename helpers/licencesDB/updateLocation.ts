import * as sqlite from "better-sqlite3";

import { licencesDB as dbPath } from "../../data/databasePaths";

import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";


export const updateLocation = (reqBody: llm.Location, reqSession: expressSession.Session): boolean => {

  const db = sqlite(dbPath);

  const nowMillis = Date.now();

  const info = db.prepare("update Locations" +
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
    " and locationID = ?")
    .run(
      reqBody.locationName,
      reqBody.locationAddress1,
      reqBody.locationAddress2,
      reqBody.locationCity,
      reqBody.locationProvince,
      reqBody.locationPostalCode,
      reqBody.locationIsDistributor ? 1 : 0,
      reqBody.locationIsManufacturer ? 1 : 0,
      reqSession.user.userName,
      nowMillis,
      reqBody.locationID
    );

  db.close();

  return info.changes > 0;
};
