import * as configFns from "../../helpers/configFns.js";
export const handler = (_req, res) => {
    res.json({
        city: configFns.getProperty("defaults.city"),
        province: configFns.getProperty("defaults.province"),
        externalLicenceNumber_fieldLabel: configFns.getProperty("licences.externalLicenceNumber.fieldLabel"),
        externalReceiptNumber_fieldLabel: configFns.getProperty("licences.externalReceiptNumber.fieldLabel"),
        reminderCategories: configFns.getProperty("reminderCategories"),
        dismissingStatuses: configFns.getProperty("reminders.dismissingStatuses")
    });
};
export default handler;
