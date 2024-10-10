import updateOrganizationRepresentative from '../../helpers/licencesDB/updateOrganizationRepresentative.js';
export default function handler(request, response, next) {
    const organizationID = Number.parseInt(request.params.organizationID, 10);
    if (Number.isNaN(organizationID)) {
        next();
        return;
    }
    const representativeObject = updateOrganizationRepresentative(organizationID, request.body);
    response.json({
        success: true,
        organizationRepresentative: representativeObject
    });
}
