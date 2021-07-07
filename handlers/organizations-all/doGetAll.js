import { getOrganizations } from "../../helpers/licencesDB/getOrganizations.js";
export const handler = (request, response) => {
    response.json(getOrganizations({}, request.session, {
        limit: -1
    }));
};
export default handler;
