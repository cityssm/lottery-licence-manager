"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrganizationReminder = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const updateOrganizationReminder = (reqBody, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB);
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
        .run(reqBody.reminderTypeKey, (reqBody.dueDateString === ""
        ? null
        : dateTimeFns.dateStringToInteger(reqBody.dueDateString)), reqBody.reminderStatus, reqBody.reminderNote, (reqBody.dismissedDateString === ""
        ? null
        : dateTimeFns.dateStringToInteger(reqBody.dismissedDateString)), reqSession.user.userName, nowMillis, reqBody.organizationID, reqBody.reminderIndex);
    db.close();
    return info.changes > 0;
};
exports.updateOrganizationReminder = updateOrganizationReminder;
