import { getDistinctTermsConditions } from "../../helpers/licencesDB/getDistinctTermsConditions.js";
export const handler = (request, response) => {
    const organizationID = request.body.organizationID;
    response.json(getDistinctTermsConditions(organizationID));
};
export default handler;
