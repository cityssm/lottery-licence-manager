import { getOrganizationBankRecordStats } from "../../helpers/licencesDB/getOrganizationBankRecordStats.js";
export const handler = (request, response) => {
    const organizationID = request.body.organizationID;
    response.json(getOrganizationBankRecordStats(organizationID));
};
export default handler;
