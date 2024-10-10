import getOrganizationRemarks from '../../helpers/licencesDB/getOrganizationRemarks.js';
export default function handler(request, response) {
    const organizationID = request.body.organizationID;
    response.json(getOrganizationRemarks(organizationID, request.session.user));
}
