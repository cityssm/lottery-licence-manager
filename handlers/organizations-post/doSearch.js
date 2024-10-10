import getOrganizations from '../../helpers/licencesDB/getOrganizations.js';
export default function handler(request, response) {
    response.json(getOrganizations(request.body, request.session.user, {
        limit: 100,
        offset: 0
    }));
}
