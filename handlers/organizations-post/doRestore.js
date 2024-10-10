import restoreOrganization from '../../helpers/licencesDB/restoreOrganization.js';
export default function handler(request, response) {
    const success = restoreOrganization(request.body.organizationID, request.session.user);
    if (success) {
        response.json({
            success: true,
            message: 'Organization restored successfully.'
        });
    }
    else {
        response.json({
            success: false,
            message: 'Organization could not be restored.'
        });
    }
}
