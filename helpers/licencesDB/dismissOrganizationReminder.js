"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dismissOrganizationReminder = void 0;
const _runSQL_1 = require("./_runSQL");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const dismissOrganizationReminder = (organizationID, reminderIndex, reqSession) => {
    const currentDate = new Date();
    return _runSQL_1.runSQL_hasChanges("update OrganizationReminders" +
        " set dismissedDate = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where organizationID = ?" +
        " and reminderIndex = ?" +
        " and dismissedDate is null" +
        " and recordDelete_timeMillis is null", [
        dateTimeFns.dateToInteger(currentDate),
        reqSession.user.userName,
        currentDate.getTime(),
        organizationID,
        reminderIndex
    ]);
};
exports.dismissOrganizationReminder = dismissOrganizationReminder;
