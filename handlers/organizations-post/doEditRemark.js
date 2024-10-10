import updateOrganizationRemark from '../../helpers/licencesDB/updateOrganizationRemark.js';
export default function handler(request, response) {
    const success = updateOrganizationRemark(request.body, request.session.user);
    if (success) {
        response.json({
            success: true,
            message: 'Remark updated successfully.'
        });
    }
    else {
        response.json({
            success: false,
            message: 'Remark could not be updated.'
        });
    }
}
