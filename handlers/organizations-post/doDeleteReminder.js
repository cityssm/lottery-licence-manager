import deleteOrganizationReminder from '../../helpers/licencesDB/deleteOrganizationReminder.js';
export default function handler(request, response) {
    const success = deleteOrganizationReminder(request.body.organizationID, request.body.reminderIndex, request.session.user);
    response.json({ success });
}
