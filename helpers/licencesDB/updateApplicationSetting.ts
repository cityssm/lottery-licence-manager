import * as sqlite from "better-sqlite3";
import { licencesDB as dbPath } from "../../data/databasePaths";


export const updateApplicationSetting =
  (settingKey: string, settingValue: string, reqSession: Express.SessionData) => {

    const db = sqlite(dbPath);

    const nowMillis = Date.now();

    const info = db.prepare("update ApplicationSettings" +
      " set settingValue = ?," +
      " recordUpdate_userName = ?," +
      " recordUpdate_timeMillis = ?" +
      " where settingKey = ?")
      .run(
        settingValue,
        reqSession.user.userName,
        nowMillis,
        settingKey
      );

    db.close();

    return info.changes > 0;
  };
