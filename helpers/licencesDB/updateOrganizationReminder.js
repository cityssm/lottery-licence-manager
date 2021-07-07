import { runSQL_hasChanges } from "./_runSQL.js";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
export const updateOrganizationReminder = (requestBody, requestSession) => {
    return runSQL_hasChanges("update OrganizationReminders" +
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
        requestBody.reminderTypeKey,
        (requestBody.dueDateString === ""
            ? undefined
            : dateTimeFns.dateStringToInteger(requestBody.dueDateString)),
        requestBody.reminderStatus,
        requestBody.reminderNote,
        (requestBody.dismissedDateString === ""
            ? undefined
            : dateTimeFns.dateStringToInteger(requestBody.dismissedDateString)),
        requestSession.user.userName,
        Date.now(),
        requestBody.organizationID,
        requestBody.reminderIndex
    ]);
};
