"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addOrganizationReminder = exports.addOrganizationReminderWithDB = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
;
exports.addOrganizationReminderWithDB = (db, reminderData, reqSession) => {
    const row = db.prepare("select ifnull(max(reminderIndex), -1) as maxIndex" +
        " from OrganizationReminders" +
        " where organizationID = ?")
        .get(reminderData.organizationID);
    const newReminderIndex = row.maxIndex + 1;
    const nowMillis = Date.now();
    db.prepare("insert into OrganizationReminders" +
        " (organizationID, reminderIndex, reminderTypeKey, reminderDate," +
        " reminderStatus, reminderNote," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(reminderData.organizationID, newReminderIndex, reminderData.reminderTypeKey, (!reminderData.reminderDateString || reminderData.reminderDateString === ""
        ? null
        : dateTimeFns.dateStringToInteger(reminderData.reminderDateString)), reminderData.reminderStatus, reminderData.reminderNote, reqSession.user.userName, nowMillis, reqSession.user.userName, nowMillis);
    const reminder = {
        recordType: "reminder",
        canUpdate: true,
        organizationID: parseInt(reminderData.organizationID, 10),
        reminderIndex: newReminderIndex,
        reminderTypeKey: reminderData.reminderTypeKey,
        reminderDate: dateTimeFns.dateStringToInteger(reminderData.reminderDateString),
        reminderDateString: reminderData.reminderDateString,
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
exports.addOrganizationReminder = (reqBody, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB);
    const reminder = exports.addOrganizationReminderWithDB(db, reqBody, reqSession);
    db.close();
    return reminder;
};
