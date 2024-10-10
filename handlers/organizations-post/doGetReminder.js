import getOrganizationReminder from '../../helpers/licencesDB/getOrganizationReminder.js';
export default function handler(request, response) {
    const organizationID = request.body.organizationID;
    const reminderIndex = request.body.reminderIndex;
    response.json(getOrganizationReminder(organizationID, reminderIndex, request.session.user));
}
