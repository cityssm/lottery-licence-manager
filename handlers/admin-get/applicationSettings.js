import getApplicationSettings from '../../helpers/licencesDB/getApplicationSettings.js';
export default function handler(_request, response) {
    const applicationSettings = getApplicationSettings();
    response.render('admin-applicationSettings', {
        headTitle: 'Application Settings',
        applicationSettings
    });
}
