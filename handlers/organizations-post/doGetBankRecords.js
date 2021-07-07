import { getOrganizationBankRecords } from "../../helpers/licencesDB/getOrganizationBankRecords.js";
export const handler = (request, response) => {
    const organizationID = request.body.organizationID;
    const bankingYear = request.body.bankingYear;
    const accountNumber = request.body.accountNumber;
    response.json(getOrganizationBankRecords(organizationID, accountNumber, bankingYear));
};
export default handler;
