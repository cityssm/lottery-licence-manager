import * as sqlite from "better-sqlite3";
import { licencesDB as dbPath } from "../../data/databasePaths";

import * as configFns from "../configFns";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";
import { canUpdateObject } from "../licencesDB";

import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";


const reminderTypeOrdering: { [reminderTypeKey: string]: number } = {};

const reminderCategories = configFns.getProperty("reminderCategories");

(() => {
  let typeIndex = 0;

  for (const reminderCategory of reminderCategories) {
    for (const reminderType of reminderCategory.reminderTypes) {
      typeIndex += 1;
      reminderTypeOrdering[reminderType.reminderTypeKey] = typeIndex;
    }
  }
})();


const sortFn_byDate = (reminderA: llm.OrganizationReminder, reminderB: llm.OrganizationReminder) => {

  /*
   * Dismissed Date
   */

  // A is not dismissed, B is, A comes first
  if (reminderA.dismissedDateString === "" && reminderB.dismissedDateString !== "") {
    return -1;
  }

  // B is not dismissed, A is, B comes first
  if (reminderB.dismissedDateString === "" && reminderA.dismissedDateString !== "") {
    return 1;
  }

  /*
   * Reminder Date
   */

  // A has no reminder, B has one, B comes first
  if (reminderA.reminderDateString === "" && reminderB.reminderDateString !== "") {
    return 1;
  }

  // B has no reminder, A has one, A comes first
  if (reminderB.reminderDateString === "" && reminderA.reminderDateString !== "") {
    return -1;
  }

  /*
   * Dismissed Date
   */

  if (reminderA.dismissedDate !== reminderB.dismissedDate) {
    return reminderB.reminderDate - reminderA.dismissedDate;
  }

  /*
   * Config File Ordering
   */

  return reminderTypeOrdering[reminderA.reminderTypeKey] - reminderTypeOrdering[reminderB.reminderTypeKey];
};

const sortFn_byConfig = (reminderA: llm.OrganizationReminder, reminderB: llm.OrganizationReminder) => {

  if (reminderA.reminderTypeKey !== reminderB.reminderTypeKey) {
    return reminderTypeOrdering[reminderA.reminderTypeKey] - reminderTypeOrdering[reminderB.reminderTypeKey];
  }

  return sortFn_byDate(reminderA, reminderB);
};


export const getOrganizationRemindersWithDB = (db: sqlite.Database, organizationID: number, reqSession: expressSession.Session) => {

  const reminders: llm.OrganizationReminder[] =
    db.prepare("select reminderIndex," +
      " reminderTypeKey, reminderDate, dismissedDate," +
      " reminderStatus, reminderNote," +
      " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis" +
      " from OrganizationReminders" +
      " where recordDelete_timeMillis is null" +
      " and organizationID = ?")
      .all(organizationID);

  for (const reminder of reminders) {

    reminder.recordType = "reminder";

    reminder.reminderDateString = dateTimeFns.dateIntegerToString(reminder.reminderDate || 0);
    reminder.dismissedDateString = dateTimeFns.dateIntegerToString(reminder.dismissedDate || 0);

    reminder.canUpdate = canUpdateObject(reminder, reqSession);
  }

  switch (configFns.getProperty("reminders.preferredSortOrder")) {

    case "date":
      reminders.sort(sortFn_byDate);
      break;

    case "config":
      reminders.sort(sortFn_byConfig);
      break;
  }

  return reminders;
};


export const getOrganizationReminders = (organizationID: number, reqSession: expressSession.Session) => {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const reminders = getOrganizationRemindersWithDB(db, organizationID, reqSession);

  db.close();

  return reminders;
};
