import dismissOrganizationReminder from '../../helpers/licencesDB/dismissOrganizationReminder.js';
import getOrganizationReminder from '../../helpers/licencesDB/getOrganizationReminder.js';
export default function handler(request, response) {
    const organizationID = request.body.organizationID;
    const reminderIndex = request.body.reminderIndex;
    const success = dismissOrganizationReminder(organizationID, reminderIndex, request.session.user);
    if (success) {
        const reminder = getOrganizationReminder(organizationID, reminderIndex, request.session.user);
        response.json({
            success: true,
            message: 'Reminder dismissed.',
            reminder
        });
    }
    else {
        response.json({
            success: false,
            message: 'Reminder could not be dismissed.'
        });
    }
}
