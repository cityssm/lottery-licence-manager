import * as sqlite from "better-sqlite3";

import { licencesDB as dbPath } from "../../data/databasePaths";

import * as llm from "../../types/recordTypes";


export const updateLocation = (reqBody: llm.Location, reqSession: Express.SessionData): boolean => {

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
