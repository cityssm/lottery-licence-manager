import { getOrganizationBankRecordStats } from "../../helpers/licencesDB/getOrganizationBankRecordStats.js";
export const handler = (req, res) => {
    const organizationID = req.body.organizationID;
    res.json(getOrganizationBankRecordStats(organizationID));
};
export default handler;
