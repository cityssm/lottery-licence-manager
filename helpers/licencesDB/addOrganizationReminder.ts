import sqlite from "better-sqlite3";

import { licencesDB as dbPath } from "../../data/databasePaths.js";

import { getMaxOrganizationReminderIndexWithDB } from "./getMaxOrganizationReminderIndex.js";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";

import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";


interface ReminderData {
  organizationID: string;
  reminderTypeKey: string;
  dueDateString?: string;
  reminderStatus: string;
  reminderNote: string;
}


export const addOrganizationReminderWithDB = (db: sqlite.Database,
  reminderData: ReminderData, reqSession: expressSession.Session) => {

  const newReminderIndex = getMaxOrganizationReminderIndexWithDB(db, reminderData.organizationID) + 1;

  const nowMillis = Date.now();

  db.prepare("insert into OrganizationReminders" +
    " (organizationID, reminderIndex, reminderTypeKey, dueDate," +
    " reminderStatus, reminderNote," +
    " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
    " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(reminderData.organizationID,
      newReminderIndex,
      reminderData.reminderTypeKey,
      (!reminderData.dueDateString || reminderData.dueDateString === ""
        ? null
        : dateTimeFns.dateStringToInteger(reminderData.dueDateString)),
      reminderData.reminderStatus,
      reminderData.reminderNote,
      reqSession.user.userName,
      nowMillis,
      reqSession.user.userName,
      nowMillis
    );

  const reminder: llm.OrganizationReminder = {
    recordType: "reminder",
    canUpdate: true,
    organizationID: parseInt(reminderData.organizationID, 10),
    reminderIndex: newReminderIndex,
    reminderTypeKey: reminderData.reminderTypeKey,
    dueDate: dateTimeFns.dateStringToInteger(reminderData.dueDateString),
    dueDateString: reminderData.dueDateString,
    dismissedDate: null,
    dismissedDateString: "",
    reminderStatus: reminderData.reminderStatus,
    reminderNote: reminderData.reminderNote,
    recordCreate_userName: reqSession.user.userName,
    recordCreate_timeMillis: nowMillis,
    recordUpdate_userName: reqSession.user.userName,
    recordUpdate_timeMillis: nowMillis
  };

  return reminder;
};


export const addOrganizationReminder = (reqBody: ReminderData, reqSession: expressSession.Session) => {

  const db = sqlite(dbPath);

  const reminder = addOrganizationReminderWithDB(db, reqBody, reqSession);

  db.close();

  return reminder;
};
