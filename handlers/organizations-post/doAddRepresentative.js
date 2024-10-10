import addOrganizationRepresentative from '../../helpers/licencesDB/addOrganizationRepresentative.js';
export default function handler(request, response, next) {
    const organizationID = Number.parseInt(request.params.organizationID, 10);
    if (Number.isNaN(organizationID)) {
        next();
        return;
    }
    const representativeObject = addOrganizationRepresentative(organizationID, request.body);
    response.json({
        success: true,
        organizationRepresentative: representativeObject
    });
}
