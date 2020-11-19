import * as sqlite from "better-sqlite3";

import { licencesDB as dbPath } from "../../data/databasePaths";

import * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";


export const createLocation = (reqBody: llm.Location, reqSession: expressSession.Session) => {

  const db = sqlite(dbPath);

  const nowMillis = Date.now();

  const info = db.prepare("insert into Locations" +
    " (locationName, locationAddress1, locationAddress2, locationCity, locationProvince, locationPostalCode," +
    " locationIsDistributor, locationIsManufacturer," +
    " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
    " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(
      reqBody.locationName,
      reqBody.locationAddress1,
      reqBody.locationAddress2,
      reqBody.locationCity,
      reqBody.locationProvince,
      reqBody.locationPostalCode,
      reqBody.locationIsDistributor || 0,
      reqBody.locationIsManufacturer || 0,
      reqSession.user.userName,
      nowMillis,
      reqSession.user.userName,
      nowMillis
    );

  db.close();

  return info.lastInsertRowid as number;

};
