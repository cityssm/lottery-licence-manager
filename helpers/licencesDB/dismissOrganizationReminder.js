"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dismissOrganizationReminder = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const dismissOrganizationReminder = (organizationID, reminderIndex, reqSession) => {
    const currentDate = new Date();
    const db = sqlite(databasePaths_1.licencesDB);
    const info = db.prepare("update OrganizationReminders" +
        " set dismissedDate = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where organizationID = ?" +
        " and reminderIndex = ?" +
        " and dismissedDate is null" +
        " and recordDelete_timeMillis is null")
        .run(dateTimeFns.dateToInteger(currentDate), reqSession.user.userName, currentDate.getTime(), organizationID, reminderIndex);
    db.close();
    return info.changes > 0;
};
exports.dismissOrganizationReminder = dismissOrganizationReminder;
