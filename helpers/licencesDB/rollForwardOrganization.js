import sqlite from "better-sqlite3";
import { licencesDB as databasePath } from "../../data/databasePaths.js";
import { getOrganizationRemindersWithDB } from "./getOrganizationReminders.js";
import { deleteOrganizationReminderWithDB } from "./deleteOrganizationReminder.js";
import { addOrganizationReminderWithDB } from "./addOrganizationReminder.js";
import * as configFns from "../configFns.js";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
export const rollForwardOrganization = (organizationID, updateFiscalYear, updateReminders, requestSession) => {
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
    }
    else if (!organizationRow.fiscalStartDate) {
        database.close();
        return {
            success: false,
            message: "The fiscal start date is not set.  Please set it, and try again."
        };
    }
    else if (!organizationRow.fiscalEndDate) {
        database.close();
        return {
            success: false,
            message: "The fiscal end date is not set.  Please set it, and try again."
        };
    }
    if (updateFiscalYear) {
        const newFiscalStartDate = dateTimeFns.dateIntegerToDate(organizationRow.fiscalStartDate);
        newFiscalStartDate.setFullYear(newFiscalStartDate.getFullYear() + 1);
        const newFiscalEndDate = dateTimeFns.dateIntegerToDate(organizationRow.fiscalEndDate);
        newFiscalEndDate.setFullYear(newFiscalEndDate.getFullYear() + 1);
        database.prepare("update Organizations" +
            " set fiscalStartDate = ?," +
            " fiscalEndDate = ?," +
            " recordUpdate_userName = ?," +
            " recordUpdate_timeMillis = ?" +
            " where organizationID = ?")
            .run(dateTimeFns.dateToInteger(newFiscalStartDate), dateTimeFns.dateToInteger(newFiscalEndDate), requestSession.user.userName, rightNowMillis, organizationID);
    }
    if (updateReminders) {
        const organizationReminders = getOrganizationRemindersWithDB(database, organizationID, requestSession);
        for (const reminder of organizationReminders) {
            const reminderType = configFns.getReminderType(reminder.reminderTypeKey);
            if (reminderType.isBasedOnFiscalYear) {
                deleteOrganizationReminderWithDB(database, organizationID, reminder.reminderIndex, requestSession);
            }
        }
        const reminderCategories = configFns.getProperty("reminderCategories");
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
