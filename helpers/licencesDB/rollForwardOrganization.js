"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rollForwardOrganization = void 0;
const sqlite = __importStar(require("better-sqlite3"));
const databasePaths_1 = require("../../data/databasePaths");
const getOrganizationReminders_1 = require("./getOrganizationReminders");
const deleteOrganizationReminder_1 = require("./deleteOrganizationReminder");
const addOrganizationReminder_1 = require("./addOrganizationReminder");
const configFns = __importStar(require("../configFns"));
const dateTimeFns = __importStar(require("@cityssm/expressjs-server-js/dateTimeFns"));
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
