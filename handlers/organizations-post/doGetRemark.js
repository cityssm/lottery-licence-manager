import { getOrganizationRemark } from "../../helpers/licencesDB/getOrganizationRemark.js";
export const handler = (request, response) => {
    const organizationID = request.body.organizationID;
    const remarkIndex = request.body.remarkIndex;
    response.json(getOrganizationRemark(organizationID, remarkIndex, request.session));
};
export default handler;
