"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrganizationReminder = void 0;
const _runSQL_1 = require("./_runSQL");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const updateOrganizationReminder = (reqBody, reqSession) => {
    return _runSQL_1.runSQL_hasChanges("update OrganizationReminders" +
        " set reminderTypeKey = ?," +
        " dueDate = ?," +
        " reminderStatus = ?," +
        " reminderNote = ?," +
        " dismissedDate = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where organizationID = ?" +
        " and reminderIndex = ?" +
        " and recordDelete_timeMillis is null", [
        reqBody.reminderTypeKey,
        (reqBody.dueDateString === ""
            ? null
            : dateTimeFns.dateStringToInteger(reqBody.dueDateString)),
        reqBody.reminderStatus,
        reqBody.reminderNote,
        (reqBody.dismissedDateString === ""
            ? null
            : dateTimeFns.dateStringToInteger(reqBody.dismissedDateString)),
        reqSession.user.userName,
        Date.now(),
        reqBody.organizationID,
        reqBody.reminderIndex
    ]);
};
exports.updateOrganizationReminder = updateOrganizationReminder;
