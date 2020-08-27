import * as sqlite from "better-sqlite3";

import { licencesDB as dbPath } from "../../data/databasePaths";


export const restoreLocation = (locationID: number, reqSession: Express.SessionData): boolean => {

  const db = sqlite(dbPath);

  const nowMillis = Date.now();

  const info = db.prepare("update Locations" +
    " set recordDelete_userName = null," +
    " recordDelete_timeMillis = null," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where recordDelete_timeMillis is not null" +
    " and locationID = ?")
    .run(
      reqSession.user.userName,
      nowMillis,
      locationID
    );

  db.close();

  return info.changes > 0;

};
