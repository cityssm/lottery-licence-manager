import * as sqlite from "better-sqlite3";

import { licencesDB as dbPath } from "../../data/databasePaths";

import type * as expressSession from "express-session";


export const deleteOrganizationReminderWithDB =
(db: sqlite.Database, organizationID: number, reminderIndex: number, reqSession: expressSession.Session) => {

  const info = db.prepare("update OrganizationReminders" +
    " set recordDelete_userName = ?," +
    " recordDelete_timeMillis = ?" +
    " where organizationID = ?" +
    " and reminderIndex = ?" +
    " and recordDelete_timeMillis is null")
    .run(reqSession.user.userName, Date.now(), organizationID, reminderIndex);

  return info.changes > 0;
};


export const deleteOrganizationReminder =
  (organizationID: number, reminderIndex: number, reqSession: expressSession.Session) => {

    const db = sqlite(dbPath);

    const result = deleteOrganizationReminderWithDB(db, organizationID, reminderIndex, reqSession);

    db.close();

    return result;
  };
