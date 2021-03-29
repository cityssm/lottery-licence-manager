import * as sqlite from "better-sqlite3";

import { licencesDB as dbPath } from "../../data/databasePaths";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";

import type * as expressSession from "express-session";


export const updateOrganizationReminder = (reqBody: {
  organizationID: string;
  reminderIndex: string;
  reminderTypeKey: string;
  dueDateString?: string;
  reminderStatus: string;
  reminderNote: string;
  dismissedDateString: string;
}, reqSession: expressSession.Session) => {

  const db = sqlite(dbPath);

  const nowMillis = Date.now();

  const info = db.prepare("update OrganizationReminders" +
    " set reminderTypeKey = ?," +
    " dueDate = ?," +
    " reminderStatus = ?," +
    " reminderNote = ?," +
    " dismissedDate = ?," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where organizationID = ?" +
    " and reminderIndex = ?" +
    " and recordDelete_timeMillis is null")
    .run(
      reqBody.reminderTypeKey,
      (reqBody.dueDateString === ""
        ? null
        : dateTimeFns.dateStringToInteger(reqBody.dueDateString)),
      reqBody.reminderStatus,
      reqBody.reminderNote,
      (reqBody.dismissedDateString === ""
        ? null
        : dateTimeFns.dateStringToInteger(reqBody.dismissedDateString)),
      reqSession.user.userName,
      nowMillis,
      reqBody.organizationID,
      reqBody.reminderIndex
    );

  db.close();

  return info.changes > 0;
};
