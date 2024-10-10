import addOrganizationReminder from '../../helpers/licencesDB/addOrganizationReminder.js';
export default function handler(request, response) {
    const reminder = addOrganizationReminder(request.body, request.session.user);
    response.json({
        success: true,
        reminder
    });
}
