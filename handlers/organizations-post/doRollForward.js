import rollForwardOrganization from '../../helpers/licencesDB/rollForwardOrganization.js';
export default function handler(request, response) {
    const organizationID = Number.parseInt(request.body.organizationID, 10);
    const updateFiscalYear = request.body.updateFiscalYear === '1';
    const updateReminders = request.body.updateReminders === '1';
    const result = rollForwardOrganization(organizationID, updateFiscalYear, updateReminders, request.session.user);
    response.json(result);
}
