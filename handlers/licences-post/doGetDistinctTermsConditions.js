import { getDistinctTermsConditions } from "../../helpers/licencesDB/getDistinctTermsConditions.js";
export const handler = (req, res) => {
    const organizationID = req.body.organizationID;
    res.json(getDistinctTermsConditions(organizationID));
};
export default handler;
