import setDefaultOrganizationRepresentative from '../../helpers/licencesDB/setDefaultOrganizationRepresentative.js';
export default function handler(request, response, next) {
    const organizationID = Number.parseInt(request.params.organizationID, 10);
    const isDefaultRepresentativeIndex = Number.parseInt(request.body.isDefaultRepresentativeIndex, 10);
    if (Number.isNaN(organizationID) ||
        Number.isNaN(isDefaultRepresentativeIndex)) {
        next();
        return;
    }
    const success = setDefaultOrganizationRepresentative(organizationID, isDefaultRepresentativeIndex);
    response.json({
        success
    });
}
