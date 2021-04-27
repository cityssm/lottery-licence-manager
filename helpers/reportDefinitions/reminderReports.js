import * as reportFns from "../../helpers/reportFns.js";
export const reports = {
    "reminders-all": {
        sql: "select * from OrganizationReminders"
    },
    "reminders-byOrganization": {
        functions: () => {
            const func = new Map();
            func.set("userFn_reminderTypeKeyToReminderType", reportFns.userFn_reminderTypeKeyToReminderType);
            return func;
        },
        sql: "select r.organizationID, o.organizationName," +
            " userFn_reminderTypeKeyToReminderType(reminderTypeKey) as reminderType," +
            " dueDate, dismissedDate," +
            " reminderStatus, reminderNote," +
            " r.recordCreate_userName, r.recordCreate_timeMillis, r.recordUpdate_userName, r.recordUpdate_timeMillis" +
            " from OrganizationReminders r" +
            " left join Organizations o on r.organizationID = o.organizationID" +
            " where r.recordDelete_timeMillis is null" +
            " and r.organizationID = ?",
        params: (req) => [req.query.organizationID]
    }
};
export default reports;
