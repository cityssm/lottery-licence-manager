import getOrganizationReminder from '../../helpers/licencesDB/getOrganizationReminder.js';
import updateOrganizationReminder from '../../helpers/licencesDB/updateOrganizationReminder.js';
export default function handler(request, response) {
    const success = updateOrganizationReminder(request.body, request.session.user);
    if (success) {
        const reminder = getOrganizationReminder(request.body.organizationID, request.body.reminderIndex, request.session.user);
        response.json({
            success: true,
            reminder
        });
    }
    else {
        response.json({
            success: false
        });
    }
}
