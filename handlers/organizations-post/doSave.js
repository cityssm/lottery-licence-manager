import createOrganization from '../../helpers/licencesDB/createOrganization.js';
import updateOrganization from '../../helpers/licencesDB/updateOrganization.js';
export default function handler(request, response) {
    if (request.body.organizationID === '') {
        const newOrganizationID = createOrganization(request.body, request.session.user);
        response.json({
            success: true,
            organizationID: newOrganizationID
        });
    }
    else {
        const success = updateOrganization(request.body, request.session.user);
        if (success) {
            response.json({
                success: true,
                message: 'Organization updated successfully.'
            });
        }
        else {
            response.json({
                success: false,
                message: 'Record Not Saved'
            });
        }
    }
}
