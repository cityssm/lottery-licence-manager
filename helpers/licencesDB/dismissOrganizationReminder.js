import { runSQL_hasChanges } from "./_runSQL.js";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
export const dismissOrganizationReminder = (organizationID, reminderIndex, requestSession) => {
    const currentDate = new Date();
    return runSQL_hasChanges("update OrganizationReminders" +
        " set dismissedDate = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where organizationID = ?" +
        " and reminderIndex = ?" +
        " and dismissedDate is null" +
        " and recordDelete_timeMillis is null", [
        dateTimeFns.dateToInteger(currentDate),
        requestSession.user.userName,
        currentDate.getTime(),
        organizationID,
        reminderIndex
    ]);
};
