import type { RequestHandler } from "express";

import * as configFns from "../../helpers/configFns";


export const handler: RequestHandler = (_req, res) => {

  res.json({
    city: configFns.getProperty("defaults.city"),
    province: configFns.getProperty("defaults.province"),
    externalLicenceNumber_fieldLabel: configFns.getProperty("licences.externalLicenceNumber.fieldLabel"),
    externalReceiptNumber_fieldLabel: configFns.getProperty("licences.externalReceiptNumber.fieldLabel"),
    reminderCategories: configFns.getProperty("reminderCategories"),
    dismissingStatuses: configFns.getProperty("reminders.dismissingStatuses")
  });
};
