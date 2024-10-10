import getUndismissedOrganizationReminders from '../../helpers/licencesDB/getUndismissedOrganizationReminders.js';
export default function handler(request, response) {
    const reminders = getUndismissedOrganizationReminders(request.session.user);
    response.render('organization-reminders', {
        headTitle: 'Organization Reminders',
        reminders
    });
}
