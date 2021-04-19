import { canUpdateObject } from "../licencesDB.js";
import sqlite from "better-sqlite3";

import { licencesDB as dbPath } from "../../data/databasePaths.js";

import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";


export const getLocation = (locationID: number, reqSession: expressSession.Session) => {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const locationObj: llm.Location =
    db.prepare("select * from Locations" +
      " where locationID = ?")
      .get(locationID);

  if (locationObj) {
    locationObj.recordType = "location";

    locationObj.locationDisplayName =
      locationObj.locationName === "" ? locationObj.locationAddress1 : locationObj.locationName;

    locationObj.canUpdate = canUpdateObject(locationObj, reqSession);
  }

  db.close();

  return locationObj;
};
