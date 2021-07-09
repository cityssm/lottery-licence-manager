import sqlite from "better-sqlite3";
import { licencesDB as databasePath } from "../../data/databasePaths.js";

import { getOrganizationRemindersWithDB } from "./getOrganizationReminders.js";
import { deleteOrganizationReminderWithDB } from "./deleteOrganizationReminder.js";
import { addOrganizationReminderWithDB } from "./addOrganizationReminder.js";

import * as configFunctions from "../functions.config.js";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";

import type * as expressSession from "express-session";


interface RollForwardOrganizationReturn {
  success: boolean;
  message?: string;
}


export const rollForwardOrganization = (organizationID: number,
  updateFiscalYear: boolean,
  updateReminders: boolean,
  requestSession: expressSession.Session): RollForwardOrganizationReturn => {

  const rightNowMillis = Date.now();

  const database = sqlite(databasePath);

  const organizationRow = database.prepare("select fiscalStartDate, fiscalEndDate" +
    " from Organizations" +
    " where organizationID = ?" +
    " and recordDelete_timeMillis is null")
    .get(organizationID);

  if (!organizationRow) {

    database.close();

    return {
      success: false,
      message: "The organization is unavailable."
    };

  } else if (!organizationRow.fiscalStartDate) {

    database.close();

    return {
      success: false,
      message: "The fiscal start date is not set.  Please set it, and try again."
    };

  } else if (!organizationRow.fiscalEndDate) {

    database.close();

    return {
      success: false,
      message: "The fiscal end date is not set.  Please set it, and try again."
    };
  }

  if (updateFiscalYear) {

    const newFiscalStartDate: Date = dateTimeFns.dateIntegerToDate(organizationRow.fiscalStartDate);
    newFiscalStartDate.setFullYear(newFiscalStartDate.getFullYear() + 1);

    const newFiscalEndDate: Date = dateTimeFns.dateIntegerToDate(organizationRow.fiscalEndDate);
    newFiscalEndDate.setFullYear(newFiscalEndDate.getFullYear() + 1);

    database.prepare("update Organizations" +
      " set fiscalStartDate = ?," +
      " fiscalEndDate = ?," +
      " recordUpdate_userName = ?," +
      " recordUpdate_timeMillis = ?" +
      " where organizationID = ?")
      .run(
        dateTimeFns.dateToInteger(newFiscalStartDate),
        dateTimeFns.dateToInteger(newFiscalEndDate),
        requestSession.user.userName,
        rightNowMillis,
        organizationID
      );
  }

  if (updateReminders) {

    // Purge reminders

    const organizationReminders = getOrganizationRemindersWithDB(database, organizationID, requestSession);

    for (const reminder of organizationReminders) {

      const reminderType = configFunctions.getReminderType(reminder.reminderTypeKey);

      if (reminderType.isBasedOnFiscalYear) {
        deleteOrganizationReminderWithDB(database, organizationID, reminder.reminderIndex, requestSession);
      }
    }

    // Create new reminders

    const reminderCategories = configFunctions.getProperty("reminderCategories");

    for (const reminderCategory of reminderCategories) {

      if (!reminderCategory.isActive) {
        continue;
      }

      for (const reminderType of reminderCategory.reminderTypes) {

        if (reminderType.isActive && reminderType.isBasedOnFiscalYear) {

          addOrganizationReminderWithDB(database, {
            organizationID: organizationID.toString(),
            reminderTypeKey: reminderType.reminderTypeKey,
            reminderStatus: undefined,
            reminderNote: ""
          }, requestSession);
        }
      }
    }
  }

  database.close();

  return {
    success: true
  };
};
