import { getUndismissedOrganizationReminders } from "../../helpers/licencesDB/getUndismissedOrganizationReminders.js";
export const handler = (request, response) => {
    const reminders = getUndismissedOrganizationReminders(request.session);
    response.render("organization-reminders", {
        headTitle: "Organization Reminders",
        reminders
    });
};
export default handler;
