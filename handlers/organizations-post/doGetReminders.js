import getOrganizationReminders from '../../helpers/licencesDB/getOrganizationReminders.js';
export default function handler(request, response) {
    const organizationID = request.body.organizationID;
    response.json(getOrganizationReminders(organizationID, request.session.user));
}
