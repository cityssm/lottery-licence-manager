import { canUpdateObject } from "../licencesDB.js";
import sqlite from "better-sqlite3";

import { licencesDB as databasePath } from "../../data/databasePaths.js";

import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";


export const getLocation = (locationID: number, requestSession: expressSession.Session): llm.Location => {

  const database = sqlite(databasePath, {
    readonly: true
  });

  const locationObject: llm.Location =
    database.prepare("select * from Locations" +
      " where locationID = ?")
      .get(locationID);

  if (locationObject) {
    locationObject.recordType = "location";

    locationObject.locationDisplayName =
      locationObject.locationName === "" ? locationObject.locationAddress1 : locationObject.locationName;

    locationObject.canUpdate = canUpdateObject(locationObject, requestSession);
  }

  database.close();

  return locationObject;
};
