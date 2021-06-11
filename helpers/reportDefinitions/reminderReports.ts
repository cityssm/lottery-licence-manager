import * as reportFns from "../../helpers/reportFns.js";

import type { ConfigReportDefinition } from "../../types/configTypes";


const reminderFunctions = () => {
  const func = new Map();
  func.set("userFn_reminderTypeKeyToReminderType", reportFns.userFn_reminderTypeKeyToReminderType);
  return func;
};


export const reports: { [reportName: string]: ConfigReportDefinition } = {

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

    params: (req) => [req.query.organizationID]
  }
};


export default reports;
