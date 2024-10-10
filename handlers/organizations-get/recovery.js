import getDeletedOrganizations from '../../helpers/licencesDB/getDeletedOrganizations.js';
export default function handler(_request, response) {
    const organizations = getDeletedOrganizations();
    response.render('organization-recovery', {
        headTitle: 'Organization Recovery',
        organizations
    });
}
