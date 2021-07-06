import sqlite from "better-sqlite3";
import { licencesDB as databasePath } from "../../data/databasePaths.js";
import { getMaxOrganizationReminderIndexWithDB } from "./getMaxOrganizationReminderIndex.js";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
export const addOrganizationReminderWithDB = (database, reminderData, requestSession) => {
    const newReminderIndex = getMaxOrganizationReminderIndexWithDB(database, reminderData.organizationID) + 1;
    const nowMillis = Date.now();
    database.prepare("insert into OrganizationReminders" +
        " (organizationID, reminderIndex, reminderTypeKey, dueDate," +
        " reminderStatus, reminderNote," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(reminderData.organizationID, newReminderIndex, reminderData.reminderTypeKey, (!reminderData.dueDateString || reminderData.dueDateString === ""
        ? undefined
        : dateTimeFns.dateStringToInteger(reminderData.dueDateString)), reminderData.reminderStatus, reminderData.reminderNote, requestSession.user.userName, nowMillis, requestSession.user.userName, nowMillis);
    const reminder = {
        recordType: "reminder",
        canUpdate: true,
        organizationID: Number.parseInt(reminderData.organizationID, 10),
        reminderIndex: newReminderIndex,
        reminderTypeKey: reminderData.reminderTypeKey,
        dueDate: dateTimeFns.dateStringToInteger(reminderData.dueDateString),
        dueDateString: reminderData.dueDateString,
        dismissedDate: undefined,
        dismissedDateString: "",
        reminderStatus: reminderData.reminderStatus,
        reminderNote: reminderData.reminderNote,
        recordCreate_userName: requestSession.user.userName,
        recordCreate_timeMillis: nowMillis,
        recordUpdate_userName: requestSession.user.userName,
        recordUpdate_timeMillis: nowMillis
    };
    return reminder;
};
export const addOrganizationReminder = (requestBody, requestSession) => {
    const database = sqlite(databasePath);
    const reminder = addOrganizationReminderWithDB(database, requestBody, requestSession);
    database.close();
    return reminder;
};
