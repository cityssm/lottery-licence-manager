"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rollForwardOrganization = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
const getOrganizationReminders_1 = require("./getOrganizationReminders");
const deleteOrganizationReminder_1 = require("./deleteOrganizationReminder");
const addOrganizationReminder_1 = require("./addOrganizationReminder");
const configFns = require("../configFns");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
exports.rollForwardOrganization = (organizationID, updateFiscalYear, updateReminders, reqSession) => {
    const rightNowMillis = Date.now();
    const db = sqlite(databasePaths_1.licencesDB);
    const organizationRow = db.prepare("select fiscalStartDate, fiscalEndDate" +
        " from Organizations" +
        " where organizationID = ?" +
        " and recordDelete_timeMillis is null")
        .get(organizationID);
    if (!organizationRow) {
        db.close();
        return {
            success: false,
            message: "The organization is unavailable."
        };
    }
    else if (!organizationRow.fiscalStartDate) {
        db.close();
        return {
            success: false,
            message: "The fiscal start date is not set.  Please set it, and try again."
        };
    }
    else if (!organizationRow.fiscalEndDate) {
        db.close();
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
        db.prepare("update Organizations" +
            " set fiscalStartDate = ?," +
            " fiscalEndDate = ?," +
            " recordUpdate_userName = ?," +
            " recordUpdate_timeMillis = ?" +
            " where organizationID = ?")
            .run(dateTimeFns.dateToInteger(newFiscalStartDate), dateTimeFns.dateToInteger(newFiscalEndDate), reqSession.user.userName, rightNowMillis, organizationID);
    }
    if (updateReminders) {
        const organizationReminders = getOrganizationReminders_1.getOrganizationRemindersWithDB(db, organizationID, reqSession);
        for (const reminder of organizationReminders) {
            const reminderType = configFns.getReminderType(reminder.reminderTypeKey);
            if (reminderType.isBasedOnFiscalYear) {
                deleteOrganizationReminder_1.deleteOrganizationReminderWithDB(db, organizationID, reminder.reminderIndex, reqSession);
            }
        }
        const reminderCategories = configFns.getProperty("reminderCategories");
        for (const reminderCategory of reminderCategories) {
            if (!reminderCategory.isActive) {
                continue;
            }
            for (const reminderType of reminderCategory.reminderTypes) {
                if (reminderType.isActive && reminderType.isBasedOnFiscalYear) {
                    addOrganizationReminder_1.addOrganizationReminderWithDB(db, {
                        organizationID: organizationID.toString(),
                        reminderTypeKey: reminderType.reminderTypeKey,
                        reminderStatus: null,
                        reminderNote: ""
                    }, reqSession);
                }
            }
        }
    }
    db.close();
    return {
        success: true
    };
};
