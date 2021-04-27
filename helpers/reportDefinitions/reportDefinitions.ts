import reports_organization from "./organizationReports.js";
import reports_representative from "./representativeReports.js";
import reports_remark from "./remarkReports.js";
import reports_reminder from "./reminderReports.js";
import reports_bankRecord from "./bankRecordReports.js";
import reports_location from "./locationReports.js";
import reports_licence from "./licenceReports.js";
import reports_ticketType from "./ticketTypeReports.js";
import reports_transaction from "./transactionReports.js";
import reports_amendment from "./amendmentReports.js";
import reports_event from "./eventReports.js";

import type { ConfigReportDefinition } from "../../types/configTypes";


export const reportDefinitions: { [reportName: string]: ConfigReportDefinition } =
  Object.assign({},
    reports_organization,
    reports_representative,
    reports_remark,
    reports_reminder,
    reports_bankRecord,
    reports_location,
    reports_licence,
    reports_ticketType,
    reports_transaction,
    reports_amendment,
    reports_event);


export default reportDefinitions;
