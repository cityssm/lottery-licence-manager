import sqlite from "better-sqlite3";
import { licencesDB as databasePath } from "../../data/databasePaths.js";

import * as configFunctions from "../functions.config.js";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import { canUpdateObject } from "../licencesDB.js";

import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";


const reminderTypeOrdering: { [reminderTypeKey: string]: number } = {};

const reminderCategories = configFunctions.getProperty("reminderCategories");

(() => {
  let typeIndex = 0;

  for (const reminderCategory of reminderCategories) {
    for (const reminderType of reminderCategory.reminderTypes) {
      typeIndex += 1;
      reminderTypeOrdering[reminderType.reminderTypeKey] = typeIndex;
    }
  }
})();


const sortFunction_byDate = (reminderA: llm.OrganizationReminder, reminderB: llm.OrganizationReminder) => {

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
   * Due Date
   */

  // A has no reminder, B has one, B comes first
  if (reminderA.dueDateString === "" && reminderB.dueDateString !== "") {
    return 1;
  }

  // B has no reminder, A has one, A comes first
  if (reminderB.dueDateString === "" && reminderA.dueDateString !== "") {
    return -1;
  }

  /*
   * Dismissed Date
   */

  if (reminderA.dismissedDate !== reminderB.dismissedDate) {
    return reminderB.dueDate - reminderA.dismissedDate;
  }

  /*
   * Config File Ordering
   */

  return reminderTypeOrdering[reminderA.reminderTypeKey] - reminderTypeOrdering[reminderB.reminderTypeKey];
};

const sortFunction_byConfig = (reminderA: llm.OrganizationReminder, reminderB: llm.OrganizationReminder) => {

  if (reminderA.reminderTypeKey !== reminderB.reminderTypeKey) {
    return reminderTypeOrdering[reminderA.reminderTypeKey] - reminderTypeOrdering[reminderB.reminderTypeKey];
  }

  return sortFunction_byDate(reminderA, reminderB);
};


export const getOrganizationRemindersWithDB = (database: sqlite.Database, organizationID: number, requestSession: expressSession.Session): llm.OrganizationReminder[] => {

  const reminders: llm.OrganizationReminder[] =
    database.prepare("select reminderIndex," +
      " reminderTypeKey, dueDate, dismissedDate," +
      " reminderStatus, reminderNote," +
      " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis" +
      " from OrganizationReminders" +
      " where recordDelete_timeMillis is null" +
      " and organizationID = ?")
      .all(organizationID);

  for (const reminder of reminders) {

    reminder.recordType = "reminder";

    reminder.dueDateString = dateTimeFns.dateIntegerToString(reminder.dueDate || 0);
    reminder.dismissedDateString = dateTimeFns.dateIntegerToString(reminder.dismissedDate || 0);

    reminder.canUpdate = canUpdateObject(reminder, requestSession);
  }

  switch (configFunctions.getProperty("reminders.preferredSortOrder")) {

    case "date":
      reminders.sort(sortFunction_byDate);
      break;

    case "config":
      reminders.sort(sortFunction_byConfig);
      break;
  }

  return reminders;
};


export const getOrganizationReminders = (organizationID: number, requestSession: expressSession.Session): llm.OrganizationReminder[] => {

  const database = sqlite(databasePath, {
    readonly: true
  });

  const reminders = getOrganizationRemindersWithDB(database, organizationID, requestSession);

  database.close();

  return reminders;
};
