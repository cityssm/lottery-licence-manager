import getInactiveOrganizations from '../../helpers/licencesDB/getInactiveOrganizations.js';
export default function handler(request, response) {
    const inactiveYears = Number.parseInt(request.body.inactiveYears, 10);
    response.json(getInactiveOrganizations(inactiveYears));
}
