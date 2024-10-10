import { deleteOrganization } from '../../helpers/licencesDB/deleteOrganization.js';
export default function handler(request, response) {
    const success = deleteOrganization(request.body.organizationID, request.session.user);
    if (success) {
        response.json({
            success: true,
            message: 'Organization deleted successfully.'
        });
    }
    else {
        response.json({
            success: false,
            message: 'Organization could not be deleted.'
        });
    }
}
