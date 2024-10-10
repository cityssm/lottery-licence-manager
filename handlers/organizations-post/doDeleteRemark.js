import deleteOrganizationRemark from '../../helpers/licencesDB/deleteOrganizationRemark.js';
export default function handler(request, response) {
    const organizationID = request.body.organizationID;
    const remarkIndex = request.body.remarkIndex;
    const success = deleteOrganizationRemark(organizationID, remarkIndex, request.session.user);
    if (success) {
        response.json({
            success: true,
            message: 'Remark deleted successfully.'
        });
    }
    else {
        response.json({
            success: false,
            message: 'Remark could not be deleted.'
        });
    }
}
