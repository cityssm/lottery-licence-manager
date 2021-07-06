import * as reportFns from "../../helpers/reportFns.js";
const reminderFunctions = () => {
    const functions = new Map();
    functions.set("userFn_reminderTypeKeyToReminderType", reportFns.userFn_reminderTypeKeyToReminderType);
    return functions;
};
export const reports = {
    "reminders-all": {
        sql: "select * from OrganizationReminders"
    },
    "reminders-formatted": {
        functions: reminderFunctions,
        sql: "select o.organizationName," +
            " userFn_reminderTypeKeyToReminderType(reminderTypeKey) as reminderType," +
            " dueDate, dismissedDate," +
            " reminderStatus, reminderNote" +
            " from OrganizationReminders r" +
            " left join Organizations o on r.organizationID = o.organizationID" +
            " where r.recordDelete_timeMillis is null" +
            " and o.recordDelete_timeMillis is null"
    },
    "reminders-byOrganization": {
        functions: reminderFunctions,
        sql: "select o.organizationName," +
            " userFn_reminderTypeKeyToReminderType(reminderTypeKey) as reminderType," +
            " dueDate, dismissedDate," +
            " reminderStatus, reminderNote" +
            " from OrganizationReminders r" +
            " left join Organizations o on r.organizationID = o.organizationID" +
            " where r.recordDelete_timeMillis is null" +
            " and r.organizationID = ?",
        params: (request) => [request.query.organizationID]
    }
};
export default reports;
