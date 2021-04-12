import { runSQLWithDB } from "../_runSQLByName";

import type * as expressSession from "express-session";

import { licencesDB as dbPath } from "../../data/databasePaths";
import * as sqlite from "better-sqlite3";


export const deleteOrganizationReminderWithDB =
  (db: sqlite.Database, organizationID: number, reminderIndex: number, reqSession: expressSession.Session) => {

    return runSQLWithDB(db,
      "update OrganizationReminders" +
      " set recordDelete_userName = ?," +
      " recordDelete_timeMillis = ?" +
      " where organizationID = ?" +
      " and reminderIndex = ?" +
      " and recordDelete_timeMillis is null", [
        reqSession.user.userName,
        Date.now(),
        organizationID,
        reminderIndex]);
  };


export const deleteOrganizationReminder =
  (organizationID: number, reminderIndex: number, reqSession: expressSession.Session) => {

    const db = sqlite(dbPath);

    const result = deleteOrganizationReminderWithDB(db,
      organizationID, reminderIndex,
      reqSession);

    db.close();

    return result;
  };
