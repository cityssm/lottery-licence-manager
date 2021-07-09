import * as configFunctions from "../../helpers/functions.config.js";
export const handler = (_request, response) => {
    response.json({
        city: configFunctions.getProperty("defaults.city"),
        province: configFunctions.getProperty("defaults.province"),
        externalLicenceNumber_fieldLabel: configFunctions.getProperty("licences.externalLicenceNumber.fieldLabel"),
        externalReceiptNumber_fieldLabel: configFunctions.getProperty("licences.externalReceiptNumber.fieldLabel"),
        reminderCategories: configFunctions.getProperty("reminderCategories"),
        dismissingStatuses: configFunctions.getProperty("reminders.dismissingStatuses")
    });
};
export default handler;
