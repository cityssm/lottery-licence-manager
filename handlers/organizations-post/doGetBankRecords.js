import getOrganizationBankRecords from '../../helpers/licencesDB/getOrganizationBankRecords.js';
export default function handler(request, response) {
    const organizationID = request.body.organizationID;
    const bankingYear = request.body.bankingYear;
    const accountNumber = request.body.accountNumber;
    response.json(getOrganizationBankRecords(organizationID, accountNumber, bankingYear));
}
