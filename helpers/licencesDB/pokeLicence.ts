import * as sqlite from "better-sqlite3";
import { licencesDB as dbPath } from "../../data/databasePaths";


export const pokeLicence = (licenceID: number, reqSession: Express.SessionData) => {

  const db = sqlite(dbPath);

  const nowMillis = Date.now();

  const info = db.prepare("update LotteryLicences" +
    " set recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where licenceID = ?" +
    " and recordDelete_timeMillis is null")
    .run(
      reqSession.user.userName,
      nowMillis,
      licenceID
    );

  db.close();

  return info.changes > 0;
};
