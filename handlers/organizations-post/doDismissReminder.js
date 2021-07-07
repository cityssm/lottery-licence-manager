import { dismissOrganizationReminder } from "../../helpers/licencesDB/dismissOrganizationReminder.js";
import { getOrganizationReminder } from "../../helpers/licencesDB/getOrganizationReminder.js";
export const handler = (request, response) => {
    const organizationID = request.body.organizationID;
    const reminderIndex = request.body.reminderIndex;
    const success = dismissOrganizationReminder(organizationID, reminderIndex, request.session);
    if (success) {
        const reminder = getOrganizationReminder(organizationID, reminderIndex, request.session);
        response.json({
            success: true,
            message: "Reminder dismissed.",
            reminder
        });
    }
    else {
        response.json({
            success: false,
            message: "Reminder could not be dismissed."
        });
    }
};
export default handler;
