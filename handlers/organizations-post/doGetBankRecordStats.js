import getOrganizationBankRecordStats from '../../helpers/licencesDB/getOrganizationBankRecordStats.js';
export default function handler(request, response) {
    const organizationID = request.body.organizationID;
    response.json(getOrganizationBankRecordStats(organizationID));
}
