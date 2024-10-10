import getOrganizations from '../../helpers/licencesDB/getOrganizations.js';
export default function handler(request, response) {
    response.json(getOrganizations({}, request.session.user, {
        limit: -1
    }));
}
