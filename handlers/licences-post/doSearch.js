import { getLicences } from "../../helpers/licencesDB/getLicences.js";
export const handler = (request, response) => {
    response.json(getLicences(request.body, request.session, {
        includeOrganization: true,
        limit: request.body.limit,
        offset: request.body.offset
    }));
};
export default handler;
