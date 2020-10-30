import * as sqlite from "better-sqlite3";
import { licencesDB as dbPath } from "../../data/databasePaths";


export const getApplicationSettings = () => {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const rows = db.prepare("select * from ApplicationSettings order by orderNumber, settingKey").all();

  db.close();

  return rows;
};
